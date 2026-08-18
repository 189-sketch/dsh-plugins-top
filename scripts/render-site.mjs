#!/usr/bin/env node
// scripts/render-site.mjs
// Generate a self-contained, beautified HTML leaderboard site at docs/index.html.
// Zero deps, no build step: data is embedded as JSON, rendered by vanilla JS.
// Deployed to GitHub Pages by .github/workflows/refresh.yml.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CATEGORIES, isListed, categorize } from './lib/shared.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data', 'plugins.json');
const DOCS = join(ROOT, 'docs');

// Slim per-repo record for embedding. Short keys keep the payload small.
function slim(it) {
  return {
    r: it.repo,
    s: it.stars,
    c: it._category,
    d: (it.description ?? '').slice(0, 220),
    v: it.verified,
    u: it.html_url,
    p: it.pushed_at,
    n: it.created_at,
    g: it._delta ?? null,
  };
}

async function loadDeltas() {
  try {
    const files = (await readdir(join(ROOT, 'data', 'history'))).filter(f => f.endsWith('.json')).sort();
    if (files.length < 2) return { map: new Map(), base: null };
    const prev = JSON.parse(await readFile(join(ROOT, 'data', 'history', files[files.length - 2]), 'utf-8'));
    return {
      map: new Map((prev.items ?? []).map(i => [i.repo, i.stars])),
      base: files[files.length - 2].slice(0, 10),
    };
  } catch {
    return { map: new Map(), base: null };
  }
}

async function main() {
  const data = JSON.parse(await readFile(DATA, 'utf-8'));
  await mkdir(DOCS, { recursive: true });

  const { map: prevStars, base: growthBase } = await loadDeltas();

  const decorated = data.items
    .slice()
    .sort((a, b) => b.stars - a.stars)
    .map(it => ({
      ...it,
      _category: categorize(it),
      _delta: prevStars.size ? it.stars - (prevStars.get(it.repo) ?? it.stars) : null,
    }));

  const listed = decorated.filter(isListed);

  const catCounts = {};
  for (const it of listed) catCounts[it._category] = (catCounts[it._category] || 0) + 1;

  const payload = {
    snapshot: data.snapshot_at,
    query: data.source_query,
    total: data.total,
    vs: data.verified_summary ?? {},
    cats: CATEGORIES.map(c => ({ name: c, count: catCounts[c] || 0 })),
    growthBase,
    items: listed.map(slim),
  };

  // Guard against `</script>` breaking out of the JSON block.
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');

  const html = TEMPLATE
    .replace('__DATA_JSON__', json)
    .replace(/__SNAPSHOT__/g, data.snapshot_at);

  await writeFile(join(DOCS, 'index.html'), html);
  console.log(`OK site: ${listed.length} listed, ${(html.length / 1024 / 1024).toFixed(2)} MB`);
}

const TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DSH Plugins Top — DeepSeek Harness 插件排行榜</title>
<style>
:root {
  --bg: #0d1117; --bg-soft: #161b22; --bg-card: #1c2128; --border: #30363d;
  --text: #e6edf3; --text-dim: #8b949e; --accent: #7c5cff; --accent2: #58a6ff;
  --green: #3fb950; --yellow: #d29922; --red: #f85149;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--bg); color: var(--text); font: 14px/1.6 -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
a { color: var(--accent2); text-decoration: none; }
a:hover { text-decoration: underline; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px 64px; }

header.top { position: sticky; top: 0; z-index: 10; background: rgba(13,17,23,.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
header.top .wrap { padding: 14px 16px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
h1 { font-size: 18px; font-weight: 700; letter-spacing: .3px; }
h1 .grad { background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.search { margin-left: auto; }
.search input { width: 260px; max-width: 60vw; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-soft); color: var(--text); outline: none; font-size: 13px; }
.search input:focus { border-color: var(--accent); }

.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin: 20px 0; }
.stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
.stat .n { font-size: 22px; font-weight: 700; }
.stat .l { color: var(--text-dim); font-size: 12px; }
.stat.ok .n { color: var(--green); } .stat.warn .n { color: var(--yellow); } .stat.bad .n { color: var(--red); }

.tabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 18px 0 12px; }
.tab { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-soft); color: var(--text-dim); cursor: pointer; font-size: 13px; user-select: none; }
.tab:hover { color: var(--text); }
.tab.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.chips { display: flex; gap: 6px; flex-wrap: wrap; margin: 0 0 12px; }
.chip { padding: 4px 12px; border-radius: 999px; border: 1px solid var(--border); background: transparent; color: var(--text-dim); cursor: pointer; font-size: 12px; }
.chip.active { border-color: var(--accent2); color: var(--accent2); }
.chip .cnt { opacity: .7; }

.meta { color: var(--text-dim); font-size: 12px; margin-bottom: 10px; }

table { width: 100%; border-collapse: collapse; }
th { text-align: left; color: var(--text-dim); font-weight: 600; font-size: 12px; padding: 8px 10px; border-bottom: 1px solid var(--border); cursor: pointer; user-select: none; white-space: nowrap; }
th:hover { color: var(--text); }
td { padding: 9px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
tbody tr:hover { background: var(--bg-soft); }
td.rank { color: var(--text-dim); width: 44px; font-variant-numeric: tabular-nums; }
td.stars { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
td.delta { color: var(--green); white-space: nowrap; font-variant-numeric: tabular-nums; }
td.desc { color: var(--text-dim); font-size: 12.5px; max-width: 420px; }
.badge-cat { display: inline-block; padding: 1px 9px; border-radius: 999px; font-size: 11px; border: 1px solid var(--border); white-space: nowrap; }
.badge-cat.skill { color: #3fb950; border-color: #3fb95055; }
.badge-cat.tool { color: #58a6ff; border-color: #58a6ff55; }
.badge-cat.skin { color: #bc8cff; border-color: #bc8cff55; }
.badge-cat.provider { color: #d29922; border-color: #d2992255; }
.badge-cat.ui-panel { color: #f778ba; border-color: #f778ba55; }
.badge-cat.other { color: #8b949e; }
.repo-name { font-weight: 600; }

footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-dim); font-size: 12px; }
.empty { padding: 48px; text-align: center; color: var(--text-dim); }
@media (max-width: 640px) { td.desc { display: none; } th.desc-col { display: none; } }
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <h1>🧭 <span class="grad">DSH Plugins Top</span></h1>
  <div class="search"><input id="q" type="search" placeholder="搜索仓库或描述…" autofocus></div>
</div></header>
<div class="wrap">
  <div class="stats" id="stats"></div>
  <div class="tabs" id="tabs"></div>
  <div class="chips" id="chips" style="display:none"></div>
  <div class="meta" id="meta"></div>
  <table>
    <thead><tr id="head"></tr></thead>
    <tbody id="body"></tbody>
  </table>
  <div class="empty" id="empty" style="display:none">没有匹配的仓库</div>
  <footer>
    数据快照 <span id="snap"></span> · 每 2 小时自动刷新 ·
    <a href="https://github.com/search?q=topic%3Adsh-plugin&type=repositories">topic:dsh-plugin</a> 全量采集 + 证据验证 ·
    蹭标签仓库已自动过滤
  </footer>
</div>
<script id="payload" type="application/json">__DATA_JSON__</script>
<script>
const DATA = JSON.parse(document.getElementById('payload').textContent);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtStars = n => n >= 10000 ? (n/1000).toFixed(1).replace(/\\.0$/,'')+'k' : n >= 1000 ? (n/1000).toFixed(2).replace(/0$/,'').replace(/\\.$/,'')+'k' : String(n);
const badgeV = v => v === 'verified' ? '✅' : v === 'likely' ? '🟡' : v === 'suspect' ? '❌' : '⚠️';
const timeAgo = iso => {
  if (!iso) return '';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return Math.max(1, Math.floor(d/60)) + ' 分钟前';
  if (d < 86400) return Math.floor(d/3600) + ' 小时前';
  if (d < 2592000) return Math.floor(d/86400) + ' 天前';
  return iso.slice(0, 10);
};

const state = { tab: 'overall', cat: 'all', q: '', sort: 'stars', dir: -1 };
const TABS = [
  { id: 'overall',    label: '🏆 总榜' },
  { id: 'categories', label: '🧩 分类榜' },
  { id: 'new',        label: '🆕 新星榜' },
  { id: 'active',     label: '🚀 活跃榜' },
  ...(DATA.growthBase ? [{ id: 'growth', label: '📈 增速榜' }] : []),
];

$('#stats').innerHTML = [
  ['收录仓库', DATA.total, ''],
  ['✅ 已验证', DATA.vs.verified ?? 0, 'ok'],
  ['🟡 疑似', DATA.vs.likely ?? 0, 'warn'],
  ['❌ 已隔离', (DATA.vs.suspect ?? 0), 'bad'],
  ['分类数', DATA.cats.filter(c => c.count > 0).length, ''],
].map(([l, n, cls]) => \`<div class="stat \${cls}"><div class="n">\${n.toLocaleString()}</div><div class="l">\${l}</div></div>\`).join('');
$('#snap').textContent = DATA.snapshot;

function renderTabs() {
  $('#tabs').innerHTML = TABS.map(t =>
    \`<div class="tab \${state.tab === t.id ? 'active' : ''}" data-tab="\${t.id}">\${t.label}</div>\`).join('');
  document.querySelectorAll('.tab').forEach(el =>
    el.addEventListener('click', () => { state.tab = el.dataset.tab; state.sort = 'stars'; state.dir = -1; render(); }));
}

function renderChips() {
  const box = $('#chips');
  if (state.tab !== 'categories') { box.style.display = 'none'; return; }
  box.style.display = 'flex';
  const chips = [{ name: 'all', count: DATA.items.length }, ...DATA.cats.filter(c => c.count > 0)];
  box.innerHTML = chips.map(c =>
    \`<div class="chip \${state.cat === c.name ? 'active' : ''}" data-cat="\${c.name}">\${esc(c.name)} <span class="cnt">\${c.count}</span></div>\`).join('');
  document.querySelectorAll('.chip').forEach(el =>
    el.addEventListener('click', () => { state.cat = el.dataset.cat; render(); }));
}

function currentList() {
  let list;
  if (state.tab === 'new')    list = [...DATA.items].sort((a, b) => (b.n || '').localeCompare(a.n || ''));
  else if (state.tab === 'active') list = [...DATA.items].sort((a, b) => (b.p || '').localeCompare(a.p || ''));
  else if (state.tab === 'growth') list = [...DATA.items].filter(i => i.g > 0).sort((a, b) => b.g - a.g);
  else                             list = DATA.items;
  if (state.tab === 'categories' && state.cat !== 'all') list = list.filter(i => i.c === state.cat);
  if (state.q) {
    const q = state.q.toLowerCase();
    list = list.filter(i => i.r.toLowerCase().includes(q) || (i.d || '').toLowerCase().includes(q));
  }
  if (state.sort === 'stars') list = [...list].sort((a, b) => (b.s - a.s) * -state.dir);
  if (state.sort === 'delta') list = [...list].sort((a, b) => ((b.g ?? -1) - (a.g ?? -1)) * -state.dir);
  return list;
}

function renderTable() {
  const showDelta = state.tab === 'growth';
  const showTime  = state.tab === 'new' || state.tab === 'active';
  $('#head').innerHTML =
    '<th>#</th><th>仓库</th><th data-sort="stars">⭐ Stars' + (state.sort === 'stars' ? (state.dir === -1 ? ' ↓' : ' ↑') : '') + '</th>' +
    (showDelta ? '<th data-sort="delta">Δ' + (state.sort === 'delta' ? (state.dir === -1 ? ' ↓' : ' ↑') : '') + '</th>' : '') +
    '<th>验证</th><th>分类</th>' + (showTime ? '<th>时间</th>' : '') + '<th class="desc-col">描述</th>';
  document.querySelectorAll('th[data-sort]').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (state.sort === k) state.dir *= -1; else { state.sort = k; state.dir = -1; }
    render();
  }));

  const list = currentList();
  const LIMIT = 300;
  $('#empty').style.display = list.length ? 'none' : 'block';
  $('#meta').textContent = (state.tab === 'growth' ? \`对比基准 \${DATA.growthBase} · \` : '') +
    \`共 \${list.length.toLocaleString()} 个仓库\${list.length > LIMIT ? \`，显示前 \${LIMIT}（用搜索缩小范围）\` : ''}\`;

  $('#body').innerHTML = list.slice(0, LIMIT).map((it, i) =>
    \`<tr><td class="rank">\${i + 1}</td>\` +
    \`<td><a class="repo-name" href="\${esc(it.u)}" target="_blank" rel="noopener">\${esc(it.r)}</a></td>\` +
    \`<td class="stars">\${fmtStars(it.s)}</td>\` +
    (showDelta ? \`<td class="delta">\${it.g > 0 ? '+' + it.g : '—'}</td>\` : '') +
    \`<td>\${badgeV(it.v)}</td>\` +
    \`<td><span class="badge-cat \${esc(it.c)}">\${esc(it.c)}</span></td>\` +
    (showTime ? \`<td style="white-space:nowrap;color:var(--text-dim);font-size:12px">\${timeAgo(state.tab === 'new' ? it.n : it.p)}</td>\` : '') +
    \`<td class="desc">\${esc(it.d)}</td></tr>\`
  ).join('');
}

let deb;
$('#q').addEventListener('input', e => { clearTimeout(deb); deb = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 150); });

function render() { renderTabs(); renderChips(); renderTable(); }
render();
</script>
</body>
</html>
`;

main().catch((e) => {
  console.error(`[render-site] FAIL: ${e.message}`);
  process.exit(1);
});
