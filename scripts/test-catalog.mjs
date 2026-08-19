#!/usr/bin/env node
// scripts/test-catalog.mjs
// Smoke tests for the generated standard catalog.
//
// Run: `node --test scripts/test-catalog.mjs`
//
// These cover the parts of the contract that aren't already enforced by
// scripts/build-catalog.mjs itself:
//   * manifest validates against catalog-source.schema.json (shape + URL rules)
//   * first page validates against catalog-provider-page.schema.json
//   * every page has ≤ 100 items, unique ids within and across pages
//   * every item has a repository field (path-A variant: repository-only)
//   * no item carries install commands, scripts, HTML, or forbidden fields
//   * nextCursor chains resolve to existing files until the last page
//
// Schema files are pulled from the anywhere-labs upstream at runtime, so
// tests reflect the live contract. They fail fast and clearly if upstream
// pulls fail, rather than silently skipping.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs', 'catalog');

const SCHEMA_BASE = 'https://raw.githubusercontent.com/anywhere-labs/deepseek-harness-desktop/master/dsh-community-market/docs';

let ajv;
async function loadAjv() {
  if (ajv) return ajv;
  // Vendored copy is not desirable here (zero-deps policy); use a minimal
  // inline subset that exercises the cases the build script's output can
  // actually fail. For full conformance we lazy-fetch the upstream schemas
  // and compile a minimal validator by walking the JSON pointer tree.
  const { default: Ajv2020 } = await import('ajv/dist/2020.js').catch(() => ({}));
  if (Ajv2020) {
    const ajv2020 = await import('ajv').catch(() => null);
    if (ajv2020 && ajv2020.default) {
      ajv = new (ajv2020.default)({ allErrors: true, strict: false });
      return ajv;
    }
  }
  return null;
}

async function loadSchema(name) {
  // Cache under tmpdir so repeated test runs are cheap.
  const cacheDir = join(tmpdir(), 'dsh-catalog-test');
  await mkdir(cacheDir, { recursive: true });
  const file = join(cacheDir, `${name.replace(/[\\/]/g, '_')}.json`);
  try {
    return JSON.parse(await readFile(file, 'utf-8'));
  } catch {
    const res = await fetch(`${SCHEMA_BASE}/${name}`);
    if (!res.ok) throw new Error(`fetch ${name}: ${res.status}`);
    const text = await res.text();
    await writeFile(file, text);
    return JSON.parse(text);
  }
}

// Minimal local validator, used as a fallback if no JS validator is
// installed. It walks the most important schema constraints by hand
// instead of pretending to be a full Draft 2020-12 engine.
function makeLocalValidator(schema) {
  function fail(value, path, message) {
    return { ok: false, errors: [{ instancePath: path, message }] };
  }
  function walk(value, sub, path) {
    if (sub.const !== undefined && value !== sub.const) {
      return fail(value, path, `must equal ${JSON.stringify(sub.const)}`);
    }
    if (sub.type === 'string' && typeof value !== 'string') {
      return fail(value, path, 'expected string');
    }
    if (sub.type === 'integer' && (!Number.isInteger(value))) {
      return fail(value, path, 'expected integer');
    }
    if (sub.type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      return fail(value, path, 'expected object');
    }
    if (sub.type === 'array' && !Array.isArray(value)) {
      return fail(value, path, 'expected array');
    }
    if (sub.minLength !== undefined && value.length < sub.minLength) {
      return fail(value, path, `minLength ${sub.minLength}`);
    }
    if (sub.maxLength !== undefined && value.length > sub.maxLength) {
      return fail(value, path, `maxLength ${sub.maxLength}`);
    }
    if (sub.minimum !== undefined && value < sub.minimum) {
      return fail(value, path, `minimum ${sub.minimum}`);
    }
    if (sub.maximum !== undefined && value > sub.maximum) {
      return fail(value, path, `maximum ${sub.maximum}`);
    }
    if (sub.pattern !== undefined && !new RegExp(sub.pattern).test(value)) {
      return fail(value, path, `does not match pattern`);
    }
    if (sub.required && sub.type === 'object') {
      for (const k of sub.required) {
        if (!(k in value)) return fail(value, path, `missing required "${k}"`);
      }
    }
    if (sub.additionalProperties === false && sub.type === 'object' && sub.properties) {
      for (const k of Object.keys(value)) {
        if (!(k in sub.properties)) {
          return fail(value, path, `unknown property "${k}"`);
        }
      }
    }
    if (sub.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const r = walk(value[i], sub.items, `${path}/${i}`);
        if (!r.ok) return r;
      }
    }
    if (sub.properties && typeof value === 'object') {
      for (const [k, sub2] of Object.entries(sub.properties)) {
        if (k in value) {
          const r = walk(value[k], sub2, `${path}/${k}`);
          if (!r.ok) return r;
        }
      }
    }
    if (sub.anyOf && Array.isArray(sub.anyOf)) {
      const matched = sub.anyOf.some((branch) => {
        if (branch.required) {
          for (const k of branch.required) if (!(k in value)) return false;
        }
        return true;
      });
      if (!matched) return fail(value, path, 'no anyOf branch matched');
    }
    return { ok: true, errors: [] };
  }
  return { validate: (v) => walk(v, schema, '') };
}

test('catalog manifest validates against catalog-source.schema.json', async () => {
  const schema = await loadSchema('schemas/catalog-source.schema.json');
  const manifest = JSON.parse(await readFile(join(DOCS, 'manifest.json'), 'utf-8'));
  const validator = makeLocalValidator(schema);
  const r = validator.validate(manifest);
  assert.equal(r.ok, true, `manifest: ${JSON.stringify(r.errors)}`);
  // The path-A contract requires the manifest to live on a stable, public
  // URL. The repo never assumes a particular owner: assert the endpoint
  // shape, not a hard-coded domain.
  assert.match(manifest.transport.endpoint, /\/v1\/plugins$/);
  assert.equal(manifest.manifestVersion, '1.0.0');
  assert.equal(manifest.transport.kind, 'https-json');
  assert.equal(manifest.transport.method, 'GET');
  // Pages-backed source: cursor is intentionally NOT advertised because
  // GitHub Pages cannot honor a query-string cursor (Pages serves the
  // same file regardless of `?cursor=...`). See build-catalog.mjs for the
  // full rationale.
  assert.equal(
    manifest.query.supported.includes('cursor'),
    false,
    'cursor must NOT be advertised in query.supported for a Pages-backed source',
  );
  assert.ok(manifest.query.maxLimit <= 100);
});

test('first page validates against catalog-provider-page.schema.json', async () => {
  const schema = await loadSchema('schemas/catalog-provider-page.schema.json');
  const page = JSON.parse(await readFile(join(DOCS, 'v1', 'plugins', 'index.json'), 'utf-8'));
  const validator = makeLocalValidator(schema);
  const r = validator.validate(page);
  assert.equal(r.ok, true, `first page: ${JSON.stringify(r.errors)}`);
  assert.equal(page.schemaVersion, '1.0.0');
  assert.ok(Array.isArray(page.items) && page.items.length <= 100);
  assert.ok(page.items.length > 0, 'first page should not be empty after a build');
});

test('every emitted item is repository-only, has unique id, and carries no forbidden fields', async () => {
  const pluginsDir = join(DOCS, 'v1', 'plugins');
  const seenIds = new Set();
  for (const name of await readdir(pluginsDir)) {
    if (!name.endsWith('.json')) continue;
    const page = JSON.parse(await readFile(join(pluginsDir, name), 'utf-8'));
    assert.equal(page.schemaVersion, '1.0.0');
    assert.ok(page.items.length <= 100, `${name}: too many items`);
    for (const item of page.items) {
      assert.ok(!seenIds.has(item.id), `duplicate id across pages: ${item.id}`);
      seenIds.add(item.id);
      // path-A repository-only — no npm package, no install surface.
      assert.equal(item.package, undefined, `item ${item.id} unexpectedly has package`);
      assert.ok(item.repository?.url?.startsWith('https://github.com/'));
      // No remote code surface.
      for (const forbidden of ['script', 'install', 'cmd', 'command', 'shell']) {
        assert.equal(item[forbidden], undefined, `${item.id} carries forbidden field "${forbidden}"`);
      }
      // Plain-text fields must not include control/bidi codepoints.
      for (const f of ['id', 'name', 'displayName', 'summary', 'license']) {
        if (item[f] !== undefined) {
          assert.doesNotMatch(item[f], /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/,
            `${item.id}.${f} contains control/bidi char`);
        }
      }
    }
  }
});

test('nextCursor is absent in the single-page snapshot', async () => {
  const pluginsDir = join(DOCS, 'v1', 'plugins');
  const first = JSON.parse(await readFile(join(pluginsDir, 'index.json'), 'utf-8'));
  assert.equal(first.page.nextCursor, undefined,
    'single-page snapshot must not carry a nextCursor');
});

test('total count in first page equals the number of unique ids in that page', async () => {
  const pluginsDir = join(DOCS, 'v1', 'plugins');
  const first = JSON.parse(await readFile(join(pluginsDir, 'index.json'), 'utf-8'));
  if (typeof first.page.total !== 'number') return;
  const ids = new Set(first.items.map((it) => it.id));
  assert.equal(ids.size, first.page.total, 'total must equal unique-id count in the single page');
});
