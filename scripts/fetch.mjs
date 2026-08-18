#!/usr/bin/env node
// scripts/fetch.mjs
// Pull every public GitHub.com repo tagged with the DSH plugin topic.
// Zero deps. Node >= 20.
//
//   GITHUB_TOKEN  optional, unlocks 5000 req/h (default 60 req/h anonymous)
//   TOPIC         override the topic (default dsh-plugin)
//
// Writes:
//   data/plugins.json             — full snapshot, latest
//   data/history/YYYY-MM-DD.json  — date-pinned daily snapshot
//
// Stdout: short status line on success.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT      = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR  = join(ROOT, 'data');
const HISTORY   = join(DATA_DIR, 'history');
const MANUAL_FILE = join(DATA_DIR, 'manual-additions.txt');
const TOKEN     = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const TOPIC     = process.env.TOPIC || 'dsh-plugin';
const PER_PAGE  = 100;
const MAX_PAGES = 10;             // GitHub caps search results at 1000 total
// Search API has its own rate budget: 10 req/min anonymous, 30 req/min with a
// token — far tighter than the core API. Pace every search call.
const SEARCH_INTERVAL_MS = TOKEN ? 2100 : 6500;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function apiHeaders() {
  const h = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'dsh-plugins-top',
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

let nextSearchAt = 0;

async function searchPage(q, page, attempt = 0) {
  const wait = nextSearchAt - Date.now();
  if (wait > 0) await sleep(wait);
  nextSearchAt = Date.now() + SEARCH_INTERVAL_MS;

  const url = new URL('https://api.github.com/search/repositories');
  url.searchParams.set('q', q);
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('page', String(page));

  const res = await fetch(url, { headers: apiHeaders() });
  if (res.status === 403) {
    const reset = Number(res.headers.get('x-ratelimit-reset') ?? '0') * 1000;
    if (attempt < 3) {
      const waitMs = Math.max(reset - Date.now(), 5000);
      console.error(`[fetch] rate limited; waiting ${Math.ceil(waitMs / 1000)}s`);
      await sleep(waitMs);
      return searchPage(q, page, attempt + 1);
    }
    throw new Error(`GitHub search still forbidden after retries for q="${q}"`);
  }
  if (!res.ok) {
    if (res.status >= 500 && attempt < 3) {
      const waitMs = 3000 * (attempt + 1);
      console.error(`[fetch] ${res.status} server error for q="${q}" page=${page}; retry in ${waitMs / 1000}s`);
      await sleep(waitMs);
      return searchPage(q, page, attempt + 1);
    }
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status} for q="${q}" page=${page}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function midpointDate(lo, hi) {
  const mid = new Date((new Date(lo).getTime() + new Date(hi).getTime()) / 2);
  return mid.toISOString().slice(0, 10);
}
function addDay(d) {
  return new Date(new Date(d).getTime() + 86400000).toISOString().slice(0, 10);
}

// GitHub search hard-caps at 1000 results per query. To cover every repo
// carrying the topic — including genuine low-star plugins — shard by star
// ranges; when a single star value alone exceeds 1000 repos, bisect the
// created-date window instead.
async function collectShard(starLo, starHi, created) {
  const range = starLo === starHi ? `${starLo}` : `${starLo}..${starHi}`;
  const q = `topic:${TOPIC} stars:${range} created:${created}`;
  const first = await searchPage(q, 1);

  if (first.total_count > 1000) {
    if (starLo !== starHi) {
      const mid = starLo + Math.floor((starHi - starLo) / 2);
      const a = await collectShard(starLo, mid, created);
      const b = await collectShard(mid + 1, starHi, created);
      return [...a, ...b];
    }
    const [cLo, cHi] = created.split('..');
    if (cLo !== cHi) {
      const mid = midpointDate(cLo, cHi);
      const a = await collectShard(starLo, starHi, `${cLo}..${mid}`);
      const b = await collectShard(starLo, starHi, `${addDay(mid)}..${cHi}`);
      return [...a, ...b];
    }
    console.error(`[fetch] WARN unshardable q="${q}" total=${first.total_count}; capped at 1000`);
  }

  const out = [...first.items];
  for (let page = 2; page <= MAX_PAGES && out.length < first.total_count; page++) {
    const data = await searchPage(q, page);
    out.push(...data.items);
    if (data.items.length < PER_PAGE) break;
  }
  console.error(`[fetch] shard stars:${range} created:${created} → ${out.length}/${first.total_count}`);
  return out;
}

async function searchAll() {
  const probe = await searchPage(`topic:${TOPIC} stars:>=0`, 1);
  console.error(`[fetch] topic:${TOPIC} total_count=${probe.total_count}`);
  if (probe.total_count <= 1000) {
    const out = [...probe.items];
    for (let page = 2; page <= MAX_PAGES && out.length < probe.total_count; page++) {
      const data = await searchPage(`topic:${TOPIC} stars:>=0`, page);
      out.push(...data.items);
      if (data.items.length < PER_PAGE) break;
    }
    return out;
  }
  // Use a fixed ceiling far above any real star count instead of the probed
  // max: the top repo can gain stars between probe and shard queries and
  // would fall outside a tight max boundary (this actually lost us
  // deepseek-harness once at 153,970 → 153,971 mid-run).
  const STAR_CEILING = 10_000_000;
  const today = new Date().toISOString().slice(0, 10);
  return collectShard(0, STAR_CEILING, `2023-01-01..${today}`);
}

function normalize(repo) {
  return {
    repo:           repo.full_name,
    stars:          repo.stargazers_count,
    forks:          repo.forks_count,
    description:    repo.description ?? '',
    homepage:       repo.homepage ?? null,
    topics:         repo.topics ?? [],
    license:        repo.license?.spdx_id ?? null,
    language:       repo.language ?? null,
    default_branch: repo.default_branch,
    pushed_at:      repo.pushed_at,
    updated_at:     repo.updated_at,
    created_at:     repo.created_at,
    archived:       repo.archived,
    disabled:       repo.disabled,
    fork:           repo.fork,
    open_issues:    repo.open_issues_count,
    html_url:       repo.html_url,
  };
}

async function fetchRepo(fullName) {
  // Core API (separate budget from search): 60/h anon, 5000/h authed.
  const res = await fetch(`https://api.github.com/repos/${fullName}`, { headers: apiHeaders() });
  if (res.status === 404) { console.error(`[fetch] manual: ${fullName} not found, skipped`); return null; }
  if (!res.ok) throw new Error(`GitHub API ${res.status} for /repos/${fullName}`);
  return res.json();
}

async function manualAdditions(all) {
  let text;
  try { text = await readFile(MANUAL_FILE, 'utf-8'); } catch { return 0; }
  const names = text.split('\n')
    .map(l => l.replace(/#.*$/, '').trim())
    .filter(l => /^[\w.-]+\/[\w.-]+$/.test(l));
  let added = 0;
  for (const name of names) {
    // case-insensitive dedup against search results
    const lower = name.toLowerCase();
    if ([...all.keys()].some(k => k.toLowerCase() === lower)) continue;
    const repo = await fetchRepo(name);
    if (repo) { all.set(repo.full_name, normalize(repo)); added++; }
  }
  if (names.length) console.error(`[fetch] manual additions: ${added} added / ${names.length} listed`);
  return added;
}

async function main() {
  await mkdir(HISTORY, { recursive: true });

  const repos = await searchAll();
  const all = new Map();
  for (const r of repos) if (!all.has(r.full_name)) all.set(r.full_name, normalize(r));
  await manualAdditions(all);

  const items = [...all.values()].sort((a, b) => b.stars - a.stars);
  const snapshot = {
    schema_version: 1,
    snapshot_at: new Date().toISOString(),
    source_query: `topic:${TOPIC} (star-range sharded) + manual-additions`,
    total: items.length,
    items,
  };

  await writeFile(join(DATA_DIR, 'plugins.json'), JSON.stringify(snapshot, null, 2) + '\n');
  const today = snapshot.snapshot_at.slice(0, 10);
  await writeFile(join(HISTORY, `${today}.json`), JSON.stringify(snapshot) + '\n');

  const authMode = TOKEN ? 'authenticated' : 'anonymous';
  console.log(`OK ${items.length} repos (${authMode}) at ${snapshot.snapshot_at}`);
}

main().catch((e) => {
  console.error(`[fetch] FAIL: ${e.message}`);
  process.exit(1);
});
