// scripts/lib/shared.mjs
// Shared logic between render.mjs (Markdown) and render-site.mjs (HTML).

export const CATEGORIES = ['skill', 'tool', 'skin', 'provider', 'ui-panel', 'other'];

export const VERDICT_BADGE = { verified: '✅', likely: '🟡', suspect: '❌', error: '⚠️', excluded: '🚫' };

export const isListed = (it) => it.verified === 'verified' || it.verified === 'likely';

// Evidence-first categorization. verify.mjs stores structured `dsh_meta`
// (pkg manifest facts) per repo; keyword heuristics are the fallback.
// Priority order matters: skin is checked before ui-panel because skins
// also ship a browser client half.
export function categorize(item) {
  const m  = item.dsh_meta ?? {};
  const t  = (item.topics ?? []).map(s => s.toLowerCase());
  const kw = (m.keywords ?? []).map(s => s.toLowerCase());
  const nm = (m.pkg_name ?? item.repo).toLowerCase();
  const ds = (item.description ?? '').toLowerCase();
  const deps = (m.dsh_deps ?? []).join(' ').toLowerCase();
  const all = [nm, ds, deps, ...t, ...kw].join(' ');
  const has = (...kws) => kws.some(k => all.includes(k));

  // 1) skin — visual themes (also have client halves; must win over ui-panel)
  if (has('skin', 'theme', '皮肤', '主题')) return 'skin';
  // 2) provider — model/LLM bridges (naming: dsh-llm-*, *-provider)
  if (has('dsh-llm-', '-provider', 'model-provider', 'llm-provider')) return 'provider';
  // 3) skill — SKILL.md at root, or explicit skill naming
  if (m.has_skill_md || (item.evidence ?? []).includes('file:SKILL.md')) return 'skill';
  if (has('dsh-skill', '-skill', 'skill')) return 'skill';
  // 4) ui-panel — ships a browser client half (pkg.dsh.client), or UI-ish naming
  if (m.has_client) return 'ui-panel';
  if (has('ui-panel', 'client-ui', 'web-ui', 'panel', 'sidebar', 'dashboard')) return 'ui-panel';
  // 5) tool — explicit tool naming
  if (has('dsh-tool', '-tool', 'tool')) return 'tool';
  return 'other';
}
