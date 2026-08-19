#!/usr/bin/env node
// scripts/build-catalog.mjs
// Build a static DSH Community Market standard catalog (manifest + GET /v1/plugins)
// from the verified entries in data/plugins.json.
//
// Path A of the catalog provider contract — no Market code change required.
// Schema reference:
//   https://github.com/anywhere-labs/deepseek-harness-desktop/blob/master/dsh-community-market/docs/catalog-provider-contract.md
//
// Zero deps. Node >= 20.
//
// Inputs : data/plugins.json (with verdict-stamped `items`)
// Outputs: docs/catalog/manifest.json
//          docs/catalog/v1/plugins/index.json     (first page, served at /v1/plugins)
//          docs/catalog/v1/plugins/page-N.json   (remaining pages, linked via cursor)
//
// Every emitted item is repository-only (no `package`, no install command), so
// any Market user with this source selected will see the entries in the
// browse-only lane. Verified-only is the user-selected strict tier; we filter
// here, never on the wire.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data', 'plugins.json');

// Output roots — match what GitHub Pages serves at project root.
const CATALOG_DIR     = join(ROOT, 'docs', 'catalog');
const PLUGINS_DIR     = join(CATALOG_DIR, 'v1', 'plugins');
const MANIFEST_FILE   = join(CATALOG_DIR, 'manifest.json');
const FIRST_PAGE_FILE = join(PLUGINS_DIR, 'index.json');
const PROVIDER_PAGE   = join(PLUGINS_DIR, '%s.json');

// Schema constants — keep in lockstep with catalog-provider-page.schema.json.
const SCHEMA_VERSION         = '1.0.0';
const MANIFEST_VERSION       = '1.0.0';
const MAX_ITEMS_PER_PAGE     = 100;   // schema $defs.item cap (also host network cap)
const CATEGORY_ID_PATTERN    = /^[a-z0-9][a-z0-9._:-]*$/;
const PLAIN_TEXT_PATTERN     = /^[^\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]*$/;
const IDENTIFIER_PATTERN     = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$/;
const HTTPS_URI_PATTERN      = /^https:\/\/(?![^/?#]*@)(?![^/?#]*:)[^#]+$/;

// Manifest URL is determined by where the project is hosted. Public consumers
// (e.g. DSH Community Market) only need the manifest URL — they fetch the
// page JSON from the declared endpoint, which lives at the same origin.
const SITE_BASE_URL = process.env.CATALOG_BASE_URL
  || 'https://189-sketch.github.io/dsh-plugins-top';
const MANIFEST_URL = `${SITE_BASE_URL}/catalog/manifest.json`;
const ENDPOINT_URL = `${SITE_BASE_URL}/catalog/v1/plugins`;

const PROVIDER_ID = 'community.dsh-plugins-top';
const PROVIDER_NAME = 'DSH Plugins Top';
const ATTRIBUTION = {
  name: 'dsh-plugins-top',
  url: SITE_BASE_URL,
  notice: 'Auto-updated leaderboard of public GitHub repositories that declare themselves as DeepSeek Harness (DSH) plugins. Verified evidence: a `dsh` field in package.json, `cordis.patch.yml` / `dsh.plugin.json` at repo root, or install-CLI documentation in the README.',
};

// --- helpers --------------------------------------------------------------

function plainText(value, { maxLength, minLength = 1, field }) {
  if (value === null || value === undefined) {
    if (minLength === 0) return undefined;
    throw new Error(`${field}: missing`);
  }
  const s = String(value);
  if (s.length < minLength) throw new Error(`${field}: shorter than ${minLength}`);
  if (s.length > maxLength) throw new Error(`${field}: longer than ${maxLength}`);
  if (!PLAIN_TEXT_PATTERN.test(s)) {
    throw new Error(`${field}: contains control or bidi characters`);
  }
  return s;
}

function identifier(s, field = 'id') {
  const v = plainText(s, { maxLength: 160, minLength: 1, field });
  if (!IDENTIFIER_PATTERN.test(v)) {
    throw new Error(`${field}: violates identifier pattern`);
  }
  return v;
}

function httpsUri(s, field) {
  if (!HTTPS_URI_PATTERN.test(s)) {
    throw new Error(`${field}: not a same-origin-free https uri`);
  }
  return s;
}

function categoryId(s) {
  if (!CATEGORY_ID_PATTERN.test(s)) {
    throw new Error(`category ${JSON.stringify(s)}: invalid id`);
  }
  return s;
}

// Map our internal tier names to the marketplace category vocabulary.
const KNOWN_CATEGORIES = new Set([
  'skill', 'tool', 'skin', 'provider', 'ui-panel', 'other',
]);

function toItem(entry) {
  // Use the repo's full_name slug as the canonical, stable item id within
  // this source. Names are stable across renames; ids never collide for
  // a single source.
  const id = identifier(entry.repo, 'id');

  const meta = entry.dsh_meta ?? {};
  const pkgName = (meta.pkg_name || '').trim();

  // Items are repository-only on purpose: this catalog is a directory of
  // public DSH-plugin GitHub repositories, not an npm-registry mirror.
  // The Market treats repository-only items as browse-only — exactly the
  // behavior this project intends (see README / wayfinder notes).
  const repositoryUrl = httpsUri(entry.html_url, 'repository.url');

  const summary = plainText(
    entry.description?.trim() || `DeepSeek Harness plugin hosted at ${entry.repo}.`,
    { maxLength: 1000, minLength: 1, field: 'summary' },
  );

  const item = {
    id,
    name: plainText(
      pkgName || entry.repo,
      { maxLength: 160, minLength: 1, field: 'name' },
    ),
    displayName: plainText(
      (entry.repo.split('/')[1] || entry.repo).slice(0, 120),
      { maxLength: 120, minLength: 1, field: 'displayName' },
    ),
    summary,
    repository: { url: repositoryUrl },
  };

  // Provenance metadata is honest signal, not remote code: license, topics,
  // timestamps, primary language. Host treats these as plain text / known
  // shapes; we never emit scripts, HTML, install commands, or remote files.
  const license = (entry.license || '').trim();
  if (license && license.length <= 80) {
    item.license = license;
  }
  if (Array.isArray(entry.keywords) && entry.keywords.length) {
    item.keywords = [...new Set(entry.keywords.map(String))]
      .filter(k => k.length > 0 && k.length <= 64)
      .slice(0, 64);
  }
  if (Array.isArray(meta.keywords) && meta.keywords.length) {
    const pkgKw = [...new Set(meta.keywords.map(String))]
      .filter(k => k.length > 0 && k.length <= 64)
      .slice(0, 64);
    item.keywords = [...new Set([...(item.keywords ?? []), ...pkgKw])].slice(0, 64);
  }
  if (KNOWN_CATEGORIES.has(entry._category)) {
    item.categories = [categoryId(entry._category)];
  } else if (Array.isArray(entry.topics)) {
    const cats = entry.topics
      .filter(t => KNOWN_CATEGORIES.has(t) && CATEGORY_ID_PATTERN.test(t));
    if (cats.length) item.categories = [...new Set(cats)].slice(0, 32);
  }
  if (entry.pushed_at) item.updatedAt = new Date(entry.pushed_at).toISOString();
  return item;
}

function buildPage(items, cursor, total) {
  const page = {};
  if (cursor) page.nextCursor = cursor;
  if (typeof total === 'number') page.total = total;
  return {
    schemaVersion: SCHEMA_VERSION,
    items,
    page,
  };
}

// --- main -----------------------------------------------------------------

async function main() {
  const data = JSON.parse(await readFile(DATA, 'utf-8'));

  // Strict tier per user decision: only verified entries. The verifier
  // already proved dsh-plugin authenticity via `pkg.dsh` / cordis.patch /
  // install docs / READMEs.
  const verified = data.items.filter(it => it.verified === 'verified');

  // Stable sort: stars desc, then full_name for tie-break determinism.
  // The Market re-orders client-side too, but stable wire order keeps
  // diffing the snapshot JSON meaningful across runs.
  const decorated = verified
    .slice()
    .sort((a, b) => (b.stars - a.stars) || a.repo.localeCompare(b.repo))
    .map((it, i) => ({ ...it, _rank: i + 1 }));

  const items = decorated.map(toItem);

  // Uniqueness guard — schema forbids repeated ids inside a page or across
  // the full snapshot. repo names are unique by GitHub invariant.
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.id)) throw new Error(`duplicate catalog id: ${it.id}`);
    seen.add(it.id);
  }

  await mkdir(PLUGINS_DIR, { recursive: true });

  // Emit page shards.
  const pages = [];
  const total = items.length;
  for (let i = 0; i < total; i += MAX_ITEMS_PER_PAGE) {
    const pageItems = items.slice(i, i + MAX_ITEMS_PER_PAGE);
    const pageNum = (i / MAX_ITEMS_PER_PAGE) + 1;
    const hasMore = i + MAX_ITEMS_PER_PAGE < total;
    const cursor = hasMore ? `page-${pageNum + 1}` : undefined;
    pages.push({ pageNum, pageItems, cursor });
  }

  // Page 1 lives at /v1/plugins (index.json), matching the manifest's
  // endpoint URL. Remaining pages follow at /v1/plugins/<cursor>.json.
  for (const { pageNum, pageItems, cursor } of pages) {
    const nextCursor = cursor;
    const payload = buildPage(pageItems, nextCursor, pageNum === 1 ? total : undefined);
    if (pageNum === 1) {
      await writeFile(FIRST_PAGE_FILE, JSON.stringify(payload, null, 2) + '\n');
    } else {
      const file = PROVIDER_PAGE.replace('%s', `page-${pageNum}`);
      await writeFile(file, JSON.stringify(payload, null, 2) + '\n');
    }
  }

  // Manifest (catalog-source v1).
  const manifest = {
    manifestVersion: MANIFEST_VERSION,
    providerId: PROVIDER_ID,
    name: PROVIDER_NAME,
    description: 'Auto-updated leaderboard of public GitHub repositories carrying the `dsh-plugin` topic, verified against real plugin evidence.',
    homepage: SITE_BASE_URL,
    attribution: ATTRIBUTION,
    transport: {
      kind: 'https-json',
      endpoint: ENDPOINT_URL,
      method: 'GET',
    },
    query: {
      supported: ['q', 'category', 'cursor', 'limit'],
      defaultLimit: 50,
      maxLimit: 100,
      sorts: [],
    },
  };
  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`OK catalog: ${items.length} verified items → ${pages.length} page(s); manifest=${MANIFEST_URL}`);
}

main().catch((e) => {
  console.error(`[build-catalog] FAIL: ${e.message}`);
  process.exit(1);
});
