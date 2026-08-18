---
name: T03 resolution — Stack and CI/CD
type: wayfinder:note
status: resolved-by-execution
resolvedAt: 2025
---

# Implementation decisions (T03, T04, T05 partly — all written before any ticket got a proper grill round)

These are the choices shipped in v1 of `dsh-plugins-top`. They were taken directly without going through their original tickets' grilling, at the user's explicit "directly start" override of wayfinder's plan-only mode. Edit or replace this file to revisit any.

## Stack (closes T03)

| Item | Choice | Why |
|---|---|---|
| Language | Node.js 20 | GitHub Actions runs it natively; `fetch` is built-in; aligns with the DSH ecosystem's own JS-first toolchain. |
| Dependencies | **Zero**. No `package-lock.json` to ship, no supply-chain surface. | A leaderboard repo is high-trust; zero-deps means no `npm audit` and no lock-rot. |
| Test runner | `node --test` (built-in) | Stdlib only. |
| CI image | `ubuntu-latest` | Default, sufficient. |
| Schedule | `cron: "0 */2 * * *"` | Every 2 hours (raised from daily on user request). Cost: ~60 search requests + 8-15 min runner per run, ×12/day — well inside free tier for public repos. Empty-change runs auto-skip the commit. Growth board stays daily-granular because `data/history/YYYY-MM-DD.json` is date-named and same-day refreshes overwrite it — deliberate, avoids 48 MB/day of history churn. |
| Triggers | `schedule` + `workflow_dispatch` + `push` to workflow/script paths | Manual replay and dev loop. |
| Permissions | `contents: write`, `pages: write`, `id-token: write` | For auto-commit and Pages deploy (Pages is wired but unused in v1). |
| Hosting | **GitHub Pages optional, not the primary surface** in v1. Workflow deploys `docs/` to Pages anyway, but the README on github.com stays the human-facing surface. | Simpler v1, avoids making the worker wait on Pages when only Markdown needs publishing. |
| Concurrency group | `refresh-leaderboards`, do-not-cancel | Don't kill an in-flight refresh to start another. |

## Data schema (closes T04 parts)

```ts
{
  schema_version: 1,            // int, additive within major
  snapshot_at:    "<ISO8601 UTC>",
  source_query:   "topic:dsh-plugin",
  total:          <int>,
  items: [
    {
      repo:           "owner/name",
      stars:          <int>,
      forks:          <int>,
      description:    "<free text, may be empty>",
      homepage:       "<url|null>",
      topics:         ["<topic>", ...],  // from GitHub topics
      license:        "<spdx|null>",     // e.g. "MIT"
      language:       "<primary language|null>",
      default_branch: "main",
      pushed_at:      "<ISO8601 UTC>",
      updated_at:     "<ISO8601 UTC>",
      created_at:     "<ISO8601 UTC>",
      archived:       <bool>,
      disabled:       <bool>,
      fork:           <bool>,
      open_issues:    <int>,
      html_url:       "https://github.com/<owner>/<repo>",
    },
    ...
  ]
}
```

History files have the same shape as `plugins.json` and live under `data/history/YYYY-MM-DD.json`.

## Anti-abuse (T05 — v2 shipped 2025, evidence-based verification)

Topic-squatting turned out to be real: high-star repos like `amruthpillai/reactive-resume` and `nexu-io/open-design` carry `topic:dsh-plugin` without being DSH plugins. v2 adds `scripts/verify.mjs` between fetch and render.

**Evidence model** (grounded in how real plugins actually ship, confirmed by inspecting locally-installed plugins):

| Tier | Signal | Source |
|---|---|---|
| DEFINITIVE | package.json has `"dsh"` field (`dsh.bundle` / `dsh.client` / `dsh.profile`) | raw package.json |
| STRONG | `cordis.patch.yml` or `dsh.plugin.json` at repo root | raw file probe |
| STRONG | README documents `dsh plugin [--profile <p>] add …` install CLI | README regex |
| STRONG | README mentions `cordis.yml` / `cordis.patch.yml` composition | README regex |
| MEDIUM | package.json keywords `dsh-plugin` / `deepseek-harness`; deps on `@deepseek-ai/dsh-*`; name `dsh-*` | raw package.json |
| MEDIUM | `SKILL.md` or `cordis.yml` at root | raw file probe |
| MEDIUM | README references `@deepseek-ai/dsh-*` or `~/.dsh/profiles/` | README regex |

**Verdicts**: `verified` (definitive or ≥1 strong) · `likely` (≥2 medium) · `suspect` (less) · `error` (fetch failure, retried next run, not cached).

**Quarantine**: only `verified` + `likely` appear in leaderboards. Suspects go to `docs/suspects.md` with the reason, so genuine authors can self-fix (add manifest/install docs) and get re-listed automatically next refresh.

**Key design choices**:
- All verification reads go through `raw.githubusercontent.com`, **zero REST API quota** — works anonymously at 1000-repo scale.
- A bare "DeepSeek Harness" mention is deliberately **not** a signal — squatters write that too (open-design's README says "Best DeepSeek Harness Design Plugin" while being a multi-CLI tool).
- Cache at `data/.cache/verify-cache.json` keyed by repo+pushed_at (gitignored; CI re-verifies fresh each run).
- Concurrency 16, retry with backoff on 429/5xx.

Still open within T05: star-farming heuristic, license filter, fork/archived policy (data is captured; rendering does not yet filter on it).

## Categorization (T02 — v2 shipped, evidence-first)

v1 categorized by bare keyword matching on topics/name/description → 65.7% landed in `other`. v2 makes verify.mjs extract **structured manifest facts** into `dsh_meta` per repo (pkg name, `dsh` field presence, `dsh.client` presence + platform, keywords, dsh deps, SKILL.md presence) and render.mjs categorizes with a priority chain:

1. **skin** — name/desc/keywords contain skin/theme/皮肤/主题 (checked first: skins also ship client halves, must beat ui-panel)
2. **provider** — `dsh-llm-*` naming or `*-provider`
3. **skill** — `SKILL.md` at repo root (fact, not keyword) or skill naming
4. **ui-panel** — `pkg.dsh.client` present (fact: ships a browser half) or UI naming (panel/sidebar/dashboard/web-ui)
5. **tool** — explicit tool naming
6. **other** — fallback

Cache version bumped to v2 so all repos re-verify once to collect `dsh_meta`; subsequent runs stay cache-hot.

Also shipped: **growth board** (`docs/growth.md`) — star delta vs previous daily snapshot, top 30, activates automatically once `data/history/` holds ≥ 2 snapshots (i.e. from the second scheduled run).

## Presentation (shipped — README Top 50 + self-contained HTML site on Pages)

User decision: README shows only the Top 50; the complete boards live on a beautified HTML page deployed to GitHub Pages.

- **`scripts/render-site.mjs`** generates `docs/index.html` — a single self-contained file (no CDN, no build step): payload embedded in a `<script type="application/json">` block (with `<` escaped to `\u003c` against script-breakout), rendered by ~5 KB of vanilla JS.
- Features: sticky header + live search, stats strip, six tabs (总榜 / 分类榜 with category chips / 新星榜 / 活跃榜 / 增速榜 auto-hidden until history exists / 隔离区), star-sort toggle, 300-row render cap with search-to-narrow hint, dark responsive theme, relative timestamps.
- Shared logic (`categorize`, `isListed`, `VERDICT_BADGE`) extracted to `scripts/lib/shared.mjs`, imported by both renderers — single source of truth for category rules.
- Deploy: `actions/configure-pages@v5` + `upload-pages-artifact` (path `docs/`) + `deploy-pages@v4`, already permissioned (`pages: write`, `id-token: write`). Repo Settings → Pages → Source: *GitHub Actions* is the one manual step.
- Payload ~1.9 MB for ~7k repos; trimmed to short-key records (`r/s/c/d/v/u/p/n/g`).

## Presentation (v2 — quarantine display removed, user decision)

The first version published `docs/suspects.md` and a site "隔离区" tab naming every filtered repo. User decision: **don't publicly display quarantined repos**. Filtering itself stays (squatters never enter any leaderboard; the count remains in the verification stats line as "❌ N filtered out"), but:

- Site: suspects tab removed; payload no longer carries the suspects array (~200 KB smaller).
- Repo: `docs/suspects.md` deleted and no longer generated; README links and wording updated ("filtered out silently").
- Verification evidence stays in `data/plugins.json` per repo for anyone who wants to audit.

Related hardening from the first CI run's failure:

- `fetch.mjs`: 5xx server errors now retry with backoff (3 attempts) — a transient 502 on shard page 6 killed the inaugural run.
- Workflow: `git pull --rebase origin main` before the bot push (concurrent human pushes no longer break the refresh run); setup-node bumped to 22.

## Open follow-ups (carry-over to next session)

1. **T01** — code-search / keyword fallback for repos that don't tag themselves properly.
2. **T02 remainder** — formal spec doc; per-category README onboarding hints; revisit `other` residue after v2 numbers land.
3. **T05 remainder** — star-farming heuristic, license policy, fork/archived filtering.
4. **Pages or replace with a static site** — the workflow already deploys `docs/`; turning it into an interactive site is one PR away.
