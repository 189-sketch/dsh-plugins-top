#!/usr/bin/env node
// scripts/verify.mjs
// Verify that each repo carrying the `dsh-plugin` topic is a GENUINE DSH plugin,
// not a traffic-squatting repo that merely added the topic.
//
// Evidence model (grounded in how real DSH plugins actually ship):
//
//   DEFINITIVE  package.json has a "dsh" field (dsh.bundle / dsh.client / dsh.profile)
//               — the plugin manifest structure real plugins declare.
//   STRONG      cordis.patch.yml or dsh.plugin.json present at repo root
//               README mentions the real install CLI:  dsh plugin [--profile <p>] add ...
//               README mentions cordis.yml / cordis.patch.yml composition
//   MEDIUM      package.json keywords include dsh-plugin / deepseek-harness
//               package.json deps include @deepseek-ai/dsh-*
//               package.json name is dsh-* / @scope/dsh-*
//               SKILL.md or cordis.yml present at repo root
//               README references @deepseek-ai/dsh-* or ~/.dsh/profiles/
//
//   verdict = verified  — definitive, or >= 1 strong
//             likely    — >= 2 medium
//             suspect   — anything less (incl. zero signals)
//             error     — fetch failure (not cached; retried next run)
//
// All reads go through raw.githubusercontent.com — NOT the REST API — so this
// step costs zero API quota and works anonymously at 1000-repo scale.
//
// Cache: data/.cache/verify-cache.json (gitignored), keyed by repo+pushed_at.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT       = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR   = join(ROOT, 'data');
const CACHE_DIR  = join(DATA_DIR, '.cache');
const CACHE_FILE = join(CACHE_DIR, 'verify-cache.json');
const PLUGINS    = join(DATA_DIR, 'plugins.json');

const CONCURRENCY = Math.max(1, Number(process.env.VERIFY_CONCURRENCY || 16));

// Bump when the per-repo result shape changes (e.g. dsh_meta added) so stale
// cache entries miss and get re-verified.
const CACHE_VERSION = 2;

const README_VARIANTS = [
  'README.md', 'readme.md', 'Readme.md', 'README.MD',
  'README.markdown', 'README.rst', 'README.txt', 'README',
];
const STRONG_FILES = ['cordis.patch.yml', 'dsh.plugin.json'];
const MEDIUM_FILES = ['SKILL.md', 'cordis.yml'];

// README regexes (case-insensitive). Deliberately anchored: a bare
// "DeepSeek Harness" mention is NOT a signal — squatters write that too.
const RE_CLI         = /dsh\s+plugin\s+(?:--profile\s+\S+\s+)?(?:add|install|remove|list|ls)\b/i;
const RE_CORDIS      = /cordis(?:\.patch)?\.yml/i;
const RE_PLUGIN_JSON = /dsh\.plugin\.json/i;
const RE_DEP         = /@deepseek-ai\/dsh-[\w-]+/i;
const RE_PROFILE_DIR = /\.dsh[\\/]profiles?[\\/]/i;

const STRONG_IDS = new Set([
  'readme:dsh-plugin-cli',
  'readme:cordis',
  'readme:dsh.plugin.json',
  'file:cordis.patch.yml',
  'file:dsh.plugin.json',
]);

// Repos that carry the topic but are not plugins by definition — the harness
// host itself, official tooling, etc. Never listed; shown in suspects.md
// under "Manually excluded" for transparency.
const EXCLUDE = new Set([
  'deepseek-ai/deepseek-harness',
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function rawText(repo, branch, path, attempt = 0) {
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'dsh-plugins-top' } });
  } catch (e) {
    if (attempt < 2) { await sleep(400 * (attempt + 1)); return rawText(repo, branch, path, attempt + 1); }
    throw e;
  }
  if (res.status === 404) return null;
  if (res.status === 429 || res.status >= 500) {
    if (attempt < 3) { await sleep(800 * (attempt + 1)); return rawText(repo, branch, path, attempt + 1); }
    throw new Error(`raw ${res.status} for ${repo}/${path}`);
  }
  if (!res.ok) throw new Error(`raw ${res.status} for ${repo}/${path}`);
  return res.text();
}

async function verifyRepo(item) {
  const { repo } = item;
  if (EXCLUDE.has(repo)) return { verdict: 'excluded', evidence: ['manual:excluded'] };
  const branch = item.default_branch || 'main';
  const evidence = [];

  // 1) package.json — cheapest and most decisive.
  let pkg = null;
  const pkgText = await rawText(repo, branch, 'package.json');
  if (pkgText) { try { pkg = JSON.parse(pkgText); } catch { /* invalid json: ignore */ } }

  // Structured metadata for downstream categorization (render.mjs).
  const meta = { pkg_name: null, has_dsh: false, has_client: false, platform: null, keywords: [], dsh_deps: [], has_skill_md: false };
  if (pkg) {
    const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
    meta.pkg_name  = pkg.name || null;
    meta.has_dsh   = !!(pkg.dsh && typeof pkg.dsh === 'object');
    meta.has_client = !!(pkg.dsh && pkg.dsh.client);
    meta.platform  = (pkg.dsh && pkg.dsh.client && pkg.dsh.client.platform) || null;
    meta.keywords  = Array.isArray(pkg.keywords) ? pkg.keywords.map(String) : [];
    meta.dsh_deps  = deps.filter(d => /(^|\/)dsh-/.test(d) || d.startsWith('@deepseek-ai/'));
  }

  if (meta.has_dsh) {
    evidence.push('pkg.dsh');
    return { verdict: 'verified', evidence, meta };
  }
  if (pkg) {
    const kw   = meta.keywords.join(' ').toLowerCase();
    const deps = meta.dsh_deps.join(' ');
    const name = String(meta.pkg_name || '').toLowerCase();
    if (/dsh-plugin|deepseek-harness/.test(kw)) evidence.push('pkg.keywords');
    if (/@deepseek-ai\/dsh-/.test(deps))        evidence.push('pkg.deps');
    if (/^dsh-|^@[\w.-]+\/dsh-/.test(name))     evidence.push('pkg.name');
  }

  // 2) strong marker files at repo root.
  for (const f of STRONG_FILES) {
    if (await rawText(repo, branch, f) !== null) evidence.push(`file:${f}`);
  }
  if (evidence.some(e => STRONG_IDS.has(e))) return { verdict: 'verified', evidence, meta };

  // 3) medium marker files.
  for (const f of MEDIUM_FILES) {
    if (await rawText(repo, branch, f) !== null) {
      evidence.push(`file:${f}`);
      if (f === 'SKILL.md') meta.has_skill_md = true;
    }
  }

  // 4) README content signals.
  let readme = null;
  for (const v of README_VARIANTS) {
    readme = await rawText(repo, branch, v);
    if (readme !== null) break;
  }
  if (readme) {
    if (RE_CLI.test(readme))         evidence.push('readme:dsh-plugin-cli');
    if (RE_CORDIS.test(readme))      evidence.push('readme:cordis');
    if (RE_PLUGIN_JSON.test(readme)) evidence.push('readme:dsh.plugin.json');
    if (RE_DEP.test(readme))         evidence.push('readme:deepseek-deps');
    if (RE_PROFILE_DIR.test(readme)) evidence.push('readme:profiles-dir');
  }

  // 5) verdict.
  const strong = evidence.filter(e => STRONG_IDS.has(e));
  if (strong.length >= 1) return { verdict: 'verified', evidence, meta };
  const medium = evidence.filter(e => !STRONG_IDS.has(e));
  if (medium.length >= 2) return { verdict: 'likely', evidence, meta };
  return { verdict: 'suspect', evidence, meta };
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }));
  return out;
}

async function main() {
  const data = JSON.parse(await readFile(PLUGINS, 'utf-8'));
  await mkdir(CACHE_DIR, { recursive: true });

  let cache = {};
  try { cache = JSON.parse(await readFile(CACHE_FILE, 'utf-8')); } catch { /* first run */ }

  let hits = 0, misses = 0;
  const results = await pool(data.items, CONCURRENCY, async (it) => {
    const c = cache[it.repo];
    if (c && c.v === CACHE_VERSION && c.pushed_at === it.pushed_at && c.verdict !== 'error' && !EXCLUDE.has(it.repo)) { hits++; return c; }
    misses++;
    try {
      const r = await verifyRepo(it);
      return { v: CACHE_VERSION, pushed_at: it.pushed_at, verdict: r.verdict, evidence: r.evidence, meta: r.meta };
    } catch (e) {
      return { v: CACHE_VERSION, pushed_at: it.pushed_at, verdict: 'error', evidence: [], error: e.message };
    }
  });

  const counts = { verified: 0, likely: 0, suspect: 0, error: 0, excluded: 0 };
  const nextCache = {};
  data.items.forEach((it, i) => {
    const r = results[i];
    it.verified = r.verdict;
    it.evidence = r.evidence;
    if (r.meta) it.dsh_meta = r.meta; else delete it.dsh_meta;
    counts[r.verdict] = (counts[r.verdict] || 0) + 1;
    if (r.verdict !== 'error') nextCache[it.repo] = r;
  });
  data.verified_summary = counts;

  await writeFile(PLUGINS, JSON.stringify(data, null, 2) + '\n');
  await writeFile(CACHE_FILE, JSON.stringify(nextCache));

  console.log(`OK verified=${counts.verified} likely=${counts.likely} suspect=${counts.suspect} error=${counts.error} excluded=${counts.excluded} (cache hits=${hits} fresh=${misses})`);
}

main().catch((e) => {
  console.error(`[verify] FAIL: ${e.message}`);
  process.exit(1);
});
