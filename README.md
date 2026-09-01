# dsh-plugins-top

<div align="center">

# 🌐 [查看完整交互榜单 → 189-sketch.github.io/dsh-plugins-top](https://189-sketch.github.io/dsh-plugins-top/)

**总榜 · 分类榜 · 新星榜 · 活跃榜 · 增速榜** — 可搜索、可筛选，每 2 小时自动刷新

</div>

> Auto-updated leaderboard of public GitHub.com repositories declaring themselves as **DeepSeek Harness (DSH) plugins**.

This project automatically collects every public repo tagged as a DSH plugin, verifies each one against real plugin evidence, and publishes multiple leaderboards — overall, by category, trending, maintained, growth — refreshed every 2 hours by GitHub Actions. The table below shows only the **Top 50**; **[visit the site](https://189-sketch.github.io/dsh-plugins-top/)** for the complete, searchable boards (or browse [`docs/`](docs/index.md) for the raw Markdown versions).

## Why

DSH is an open ecosystem of composable plugins: skills, tools, themes, providers, UI panels, and more. Discoverability is hard when the registry is fragmented. `dsh-plugins-top` provides one canonical, auto-updated point of comparison.

## Use this repo as a DSH Community Market catalog source

This project also publishes a [DSH Community Market standard catalog](https://github.com/anywhere-labs/deepseek-harness-desktop/blob/master/dsh-community-market/docs/catalog-provider-contract.md) — Path A, no Market code change required. The manifest tells any compliant Market host how to fetch our verified GitHub-plugin directory as a readonly, repository-only catalog.

The catalog is served from **two** URLs (same content, mirror). Use the Cloudflare Worker URL as the primary — it sets `Content-Type: application/json` for the extension-less `/v1/plugins` endpoint that the runtime requires. The GitHub Pages URL stays reachable as a read-only mirror.

```text
Primary  (Cloudflare Worker)
  Manifest : https://dsh-plugins-top.charlie901030.workers.dev/catalog/manifest.json
  Endpoint : https://dsh-plugins-top.charlie901030.workers.dev/catalog/v1/plugins

Mirror   (GitHub Pages — historical, no Content-Type fix)
  Manifest : https://189-sketch.github.io/dsh-plugins-top/catalog/manifest.json
  Endpoint : https://189-sketch.github.io/dsh-plugins-top/catalog/v1/plugins

Self-host : override via CATALOG_BASE_URL when running scripts/build-catalog.mjs
```

> **Why the mirror is not the primary**: GitHub Pages 301-redirects `/v1/plugins` to `/v1/plugins/` (directory-index behavior) AND serves extension-less files with `Content-Type: application/octet-stream`. Both break the runtime (`catalog-provider-contract.zh.md` requires the final URL to match the schema regex `/v1/plugins$` and a JSON Content-Type). The Worker side dodges both: no directory redirect and a Transform Rule pins `Content-Type: application/json`.

The catalog only contains **`verified`** entries (definitive evidence — `dsh` field in `package.json`, `cordis.patch.yml` / `dsh.plugin.json`, or install-CLI docs in the README). Items are **repository-only**: Market will show them in the browse-only lane (same status as dshfind today) and never auto-install. No install command, no script, no shell fragment is ever emitted — the contract forbids it.

Rebuild during the scheduled refresh via `scripts/build-catalog.mjs`. Smoke tests run via `npm test` (`scripts/test-catalog.mjs` validates the manifest and first page against the live upstream schemas).

## How it works

- **Discovery**: GitHub REST search by `topic:dsh-plugin`, sharded by star ranges (with created-date bisection) to defeat the 1,000-result search cap — full coverage, including 0-star newcomers. Plus [`data/manual-additions.txt`](data/manual-additions.txt) for genuine plugins that don't use the topic.
- **Verification**: every repo is checked for real plugin evidence — a `"dsh"` manifest field in package.json, `cordis.patch.yml` / `dsh.plugin.json` at the root, or `dsh plugin --profile …` install docs in the README. Repos without evidence are filtered out, never listed.
- **Data**: `data/plugins.json` (full snapshot) + `data/history/YYYY-MM-DD.json` (daily history).
- **Render**: Multiple leaderboards under `docs/` and the table below.
- **Update cadence**: Every 2 hours (`cron: "0 */2 * * *"`). Growth deltas stay daily-granular (same-day history snapshots are overwritten).
- **Stack**: Zero dependencies. Pure Node.js 20 + native `fetch`.

## Leaderboards

- [Full list](docs/index.md)
- [Categories](docs/categories/)
- [Trending (newest 30)](docs/trending.md)
- [Maintained (recently pushed)](docs/maintained.md)
- [Growth (fastest rising)](docs/growth.md) — activates from the second snapshot

## Adding your plugin

1. Add the `dsh-plugin` topic to your GitHub repo (Settings → About → Topics).
2. Optional but recommended: add a category hint such as `dsh-skill`, `dsh-tool`, `dsh-skin`, `dsh-provider`, or `dsh-ui-panel`.
3. Wait for the next scheduled refresh (≤ 2 h), or run `npm run build` locally if you have a `GITHUB_TOKEN` with 5,000 req/h.

**Don't want to use topics?** Open a PR appending one `owner/repo` line to [`data/manual-additions.txt`](data/manual-additions.txt) — the next refresh fetches it directly. Either way, your repo must pass the same evidence-based verification (a `"dsh"` field in package.json, a `cordis.patch.yml` / `dsh.plugin.json`, or `dsh plugin --profile …` install docs in the README) or it is filtered out silently.

## Self-hosting

1. Fork this repo and enable Actions.
2. Settings → Pages → Source: select **GitHub Actions** (or run `gh api repos/<owner>/<repo>/pages -X POST -F build_type=workflow`). The workflow deploys `docs/index.html` to `https://<owner>.github.io/dsh-plugins-top/` on every refresh.
3. Optionally add a personal token as the `GITHUB_TOKEN` secret to lift the rate ceiling (the default Actions token works fine).

## License

MIT — see [LICENSE](LICENSE).

---

<!-- BEGIN:BOT -->
<!-- Auto-generated by scripts/render.mjs — DO NOT EDIT BELOW. -->

Snapshot: `2026-09-01T22:29:00.713Z` · Indexed: **13144** repos · Schema: v1 · Query: `topic:dsh-plugin (star-range sharded) + manual-additions`

Verification: ✅ 11846 verified · 🟡 172 likely · ❌ 1125 filtered out

## Top 50 by stars (verified plugins only)

| # | Repo | Stars | Verified | Description | Category |
|---|---|---|---|---|---|
| #1 | [tt-a1i/archify](https://github.com/tt-a1i/archify) | ⭐ 41750 | ✅ | Agent skill for beautiful, verifiable architecture, workflow, sequence, data-flow, and lifecycle diagrams—self-contained HTML with motion and crisp export. | `skill` |
| #2 | [Tencent/WeKnora](https://github.com/Tencent/WeKnora) | ⭐ 21126 | ✅ | Open-source LLM knowledge platform: turn raw documents into a queryable RAG, an autonomous reasoning agent, and a self-maintaining Wiki. | `other` |
| #3 | [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) | ⭐ 14065 | ✅ | A curated list of plugins for DeepSeek Harness (dsh) · DeepSeek Harness 插件精选列表 | `other` |
| #4 | [MemTensor/MemOS](https://github.com/MemTensor/MemOS) | ⭐ 11140 | ✅ | Self-evolving memory OS for LLM & AI Agents: ultra-persistent memory, hybrid-retrieval, and cross-task skill reuse, with 35.24% token savings and DeepSeek Harness support. | `skill` |
| #5 | [yjh051108/dsh-routing-suite](https://github.com/yjh051108/dsh-routing-suite) | ⭐ 7020 | ✅ | dsh-routing-suite — injector + router-standard kit: install the runtime injector first, then the task-aware reasoning-mode router preset (measured P1-P23). | `ui-panel` |
| #6 | [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | ⭐ 6661 | ✅ | DeepSeek Harness (DSH) Web Plugin Aggregation Ecosystem · Everything is a plugin, distributed via the Creative Workshop | `ui-panel` |
| #7 | [Q00/ouroboros](https://github.com/Q00/ouroboros) | ⭐ 5747 | ✅ | Agent OS: the agent gets smarter on its own. We just hold the line: the grading command and expected result never make it into the success contract we hand it. Interview-gated, staged evaluation, budgeted evolution loop. MCP server, 13 runtimes: Claude Code, Codex CLI, Gemini CLI, OpenCode, Copilot, Kiro and more. | `skill` |
| #8 | [huangruiteng/loopx](https://github.com/huangruiteng/loopx) | ⭐ 5394 | ✅ | Long-horizon agent control plane for durable, governed work across Codex, Claude Code, and other harnesses. | `other` |
| #9 | [Devin-AXIS/iPolloWork](https://github.com/Devin-AXIS/iPolloWork) | ⭐ 5241 | ✅ | Enterprise-grade, local-first Agent Workbench for people and agent teams. A unified multi-engine workspace for Codex Harness, DeepSeek Harness, and OpenCode, with unified plugins and Skills, multi-agent projects and tasks, and editable code, documents, presentations, design, and video. | `skill` |
| #10 | [liustack/modlens](https://github.com/liustack/modlens) | ⭐ 3828 | ✅ | The first vision plugin for DeepSeek Harness, and the vision bridge for every text-only coding agent. Paste an image, get structured JSON evidence (OCR, layout, semantics). \| 全网最强 DeepSeek Harness 外挂视觉插件，为 DeepSeek、GLM 等纯文本模型外挂视觉能力，粘贴图片即得结构化 JSON 证据（OCR、版面、语义）。 | `skill` |
| #11 | [xiaobright/dsh-anchored-standard](https://github.com/xiaobright/dsh-anchored-standard) | ⭐ 3822 | ✅ | Two-phase DeepSeek Harness preset: Minimal-aligned bootstrap, then full Standard tools (Project2 98/99) | `tool` |
| #12 | [agentscope-ai/ReMe](https://github.com/agentscope-ai/ReMe) | ⭐ 3383 | ✅ | ReMe: Memory Management Kit for Agents - Remember Me, Refine Me. | `other` |
| #13 | [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) | ⭐ 3214 | ✅ | 开放的侧边栏底座，支持三方拓展注册新侧边栏页面。内置文件渲染编辑/终端/侧边对话/Git/子代理页面 ｜ Open sidebar foundation, supports third-party extensions to register new sidebar pages. Built-in file rendering/editing, terminal, side chat, Git, and sub-agent pages. | `ui-panel` |
| #14 | [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) | ⭐ 3006 | ✅ | The plugin market inside DeepSeek Harness — browse, search, one-click install · DSH 可视化插件市场 | `ui-panel` |
| #15 | [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) | ⭐ 2767 | ✅ | DSH 官方公众号收录的 TUI 补位插件：Claude Code 风，鲸鱼顶栏/实时状态/流式思考/双击 Esc 回滚/上下文进度+TPS。npm 一键装。  DSH official WeChat featured TUI plugin — Claude Code style: whale bar, live status, streaming thoughts, double-Esc rollback, context bar + TPS. npm one-click. | `provider` |
| #16 | [zilliztech/memsearch](https://github.com/zilliztech/memsearch) | ⭐ 2544 | ✅ | A persistent, unified memory layer for all your AI agents (e.g. Claude Code, Codex, DSH), backed by Markdown and Milvus. | `skill` |
| #17 | [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) | ⭐ 1877 | ✅ | Whale Girl skin series for DeepSeek Harness. 适用于 DeepSeek Harness 的，鲸鱼娘系列皮肤。 | `skin` |
| #18 | [Tencent/BrowserSkill](https://github.com/Tencent/BrowserSkill) | ⭐ 1671 | ✅ | Let AI agents use your real, logged-in browser without interrupting your work. CLI + extension for browser automation across any shell-capable AI agent. | `skill` |
| #19 | [MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget) | ⭐ 1559 | ✅ | DeepSeek Harness（DSH）一只住在 DSH 界面右下角的小鲸鱼娘，帮你盯着DeepSeek账户余额。QQ弹弹，支持拖拽吸附、左吸附翻转、数字滚动动画，随界面自动启用，建议直接喊来你的dsh安装 | `tool` |
| #20 | [AdamPlatin123/dsh-plugin-radar](https://github.com/AdamPlatin123/dsh-plugin-radar) | ⭐ 1440 | ✅ | DSH Plugin Radar — 开源 DSH 插件生态雷达：自动发现 15900+ 候选、k8s 运行级实测 10000+、15 分钟快照管线；插件目录是其自动生成的 artifact | `other` |
| #21 | [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) | ⭐ 1258 | ✅ | AgentTeams plugin for DeepSeek Harness | `provider` |
| #22 | [bowenliang123/dsh-context](https://github.com/bowenliang123/dsh-context) | ⭐ 1233 | ✅ | The best DeepSeek Harness plugin for context insight and management, with context dashboard / browser and context command, for context statistics, composition, breakdown, evolution details, understanding how the context is made of, and how it evolves. 一站式 DeepSeek Harness 上下文可视化插件，Context 面板及浏览器与 Context 命令，透视上下文组成、演进、压缩、剪枝等事件与动作。 | `ui-panel` |
| #23 | [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) | ⭐ 1162 | ✅ | Make AI coding agents architecture-aware: baseline-first, evidence-verified, drift-checked, and safe across long tasks. | `skill` |
| #24 | [agentrq/agentrq](https://github.com/agentrq/agentrq) | ⭐ 1099 | ✅ | AgentRQ: Human-in-loop realtime conversational task manager for AI Agents. Self-hosted! Control your own agents from wherever you want Mobile, Web, Desktop. Designed to work well with your own Claude subscriptions and any harness. | `other` |
| #25 | [TencentCloudBase/CloudBase-AI-Toolkit](https://github.com/TencentCloudBase/CloudBase-AI-Toolkit) | ⭐ 1089 | ✅ | Backend for AI coding agents on CloudBase — database, auth, functions via Plugin, Skills & MCP. | `skill` |
| #26 | [xmanrui/dsh-im](https://github.com/xmanrui/dsh-im) | ⭐ 1052 | ✅ | 通过扫码或机器人凭据把IM机器人接入DeepSeek Harness（支持飞书、微信、钉钉、企业微信、QQ、Slack、Telegram、Discord和WhatsApp）。 Connect IM bots to DeepSeek Harness via QR code or credentials (9 channels). | `ui-panel` |
| #27 | [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) | ⭐ 1045 | ✅ | Eyes for text-only DeepSeek Harness agents: built-in free vision chain (no key) + pixel-level vision tools (Q&A, grounding, crop, pixel diff, colors, OCR, SVG trace, cutout, screenshots). One-command install, no Python, image turns work like ordinary tool-calling turns. | `provider` |
| #28 | [Anil-matcha/awesome-dsh-plugin](https://github.com/Anil-matcha/awesome-dsh-plugin) | ⭐ 992 | ✅ | A curated list of plugins for DeepSeek Harness (dsh) - DeepSeek Harness plugin ecosystem | `ui-panel` |
| #29 | [mindscale-noah/MindMemOS](https://github.com/mindscale-noah/MindMemOS) | ⭐ 970 | ✅ |  | `skill` |
| #30 | [0xsline/awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness) | ⭐ 970 | ✅ | DeepSeek Harness (DSH) ecosystem: curated plugins, tools, and infrastructure from dsh-external/hub and the public dsh-plugin topic. | `tool` |
| #31 | [shaobeichen/dsh-pocket](https://github.com/shaobeichen/dsh-pocket) | ⭐ 885 | ✅ | 把 DeepSeek Harness 装进你的口袋：电脑上跑 dsh web，手机扫码即同步访问（局域网 + 公网，实时同屏）Put DeepSeek Harness in your pocket: run dsh web on your computer and access it synchronously by scanning a QR code on your phone (LAN + public network, real‑time screen mirroring) | `ui-panel` |
| #32 | [superdesigndev/treg](https://github.com/superdesigndev/treg) | ⭐ 865 | ✅ | OpenRouter for agent tools. Join community here: https://discord.gg/6mQYYfFMAn | `tool` |
| #33 | [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) | ⭐ 850 | ✅ | [dsh]为纯文本模型设计更强大的视觉工具箱：一行安装使用、粘贴图片直接识别、多张图片问答、截图到前端UI 还原等｜DeepSeek Harness-native integration for agent-vision-toolkit: image Q&A, long-screenshot OCR, UI restoration, grounding, pixel diff, Artifacts, and Web UI. | `skill` |
| #34 | [toby-bridges/api-relay-audit](https://github.com/toby-bridges/api-relay-audit) | ⭐ 821 | ✅ | Local security audit for AI API relays and LLM proxies: detects prompt injection, model substitution, tool-call rewriting, SSE anomalies, error leakage, and Web3 wallet risks. | `tool` |
| #35 | [Minglink/dsh-infinite-gen-3](https://github.com/Minglink/dsh-infinite-gen-3) | ⭐ 796 | ✅ | DeepSeek 专用破甲插件「无限三代」dsh-infinite-gen-3 — armor-breaking plugin for DeepSeek，破甲版：稳定化破甲，求 Star 收藏 ⭐ | `ui-panel` |
| #36 | [Electricitysheep/dsh-handbook](https://github.com/Electricitysheep/dsh-handbook) | ⭐ 724 | ✅ | DeepSeek Harness (dsh) 从 0 到 1 深度手册：安装/插件开发/性能调优/实测案例/同模型多 Agent 实测对比（中文 + 英文 PDF） | `other` |
| #37 | [Devin-AXIS/deepseek-design](https://github.com/Devin-AXIS/deepseek-design) | ⭐ 679 | ✅ | DeepSeek Harness 可编辑设计系统：AI 生成、可视化编辑、模板市场与 PPT｜Native Design & PPT Studio for DeepSeek Harness. | `other` |
| #38 | [ccch1mneyyy/working-activity](https://github.com/ccch1mneyyy/working-activity) | ⭐ 656 | ✅ | Lively Working-line extension for pi CLI and DSH | `other` |
| #39 | [whitelonng/dshcode](https://github.com/whitelonng/dshcode) | ⭐ 648 | 🟡 | Community desktop companion for DeepSeek Harness — one-click Electron app for macOS and Windows | `tool` |
| #40 | [sandbaseai/sandbase-harness](https://github.com/sandbaseai/sandbase-harness) | ⭐ 641 | ✅ | Local-first, self-hosted AI agent runtime and MCP bridge with sandboxed sessions, memory, credentials, audit/replay, and a local Console. | `skill` |
| #41 | [vibeinging/dsh-desktop](https://github.com/vibeinging/dsh-desktop) | ⭐ 636 | ✅ | DeepSeek Harness Desktop App: a local AI desktop workspace for DSH Sessions, projects, files, web research, plugins, and Office artifacts. | `other` |
| #42 | [chainbase-labs/Agentkey](https://github.com/chainbase-labs/Agentkey) | ⭐ 624 | ✅ | Connect your AI agent to the world — Web search, Social media, Crypto & On-chain data. One plugin, zero extra config. | `skill` |
| #43 | [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) | ⭐ 596 | ✅ | 把 DSH 变成 2005 年门户网站｜Parody ads, fake games, and popups for the DSH Web UI | `ui-panel` |
| #44 | [adoresever/graph-memory](https://github.com/adoresever/graph-memory) | ⭐ 591 | ✅ | Deepseek Harness、Openclaw知识图谱记忆插件。2026年4月受邀发布在清华大学讨论会。Knowledge Graph + Memory；Knowledge Graph Context Engine for OpenClaw — extracts structured triples from conversations, compresses context 75%, enables cross-session experience reuse | `other` |
| #45 | [fufankeji/deepseek-harness-studio](https://github.com/fufankeji/deepseek-harness-studio) | ⭐ 590 | 🟡 | DeepSeek Harness 零代码桌面端｜一键启动，支持 Windows 与 macOS；内置插件发现、热点插件推送、一键安装与管理、AI 智能推荐和视觉增强。 | `tool` |
| #46 | [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) | ⭐ 550 | ✅ | Chrome sidebar extension that lets DeepSeek Harness operate your browser directly, no vision capabilities required. 一款 Chrome 侧边栏扩展程序，可让 DeepSeek Harness 直接操控您的浏览器，无需视觉能力。 | `ui-panel` |
| #47 | [EthanYoQ/AI-Novel-Writer](https://github.com/EthanYoQ/AI-Novel-Writer) | ⭐ 546 | ✅ | AI 小说创作软件：把灵感、角色、世界观、大纲、章节写作、审稿和修稿组织成可控流程；提供 Windows/macOS 桌面版、Ollama 与 DSH 插件预览。 | `other` |
| #48 | [mnemon-dev/mnemon](https://github.com/mnemon-dev/mnemon) | ⭐ 544 | ✅ | LLM-supervised persistent memory for AI agents — graph-based recall, cross-session knowledge, single binary. Works with DeepSeek Harness, Claude Code, OpenClaw, and any agent runtime. | `tool` |
| #49 | [PC2005-cloud/dsh-pet](https://github.com/PC2005-cloud/dsh-pet) | ⭐ 504 | ✅ | DSH 桌面宠物：一行命令装好即用的透明动画小桌宠，支持多开、大小位置随心配置；还内置 DIY 素材链，能用 AI 视频自造专属宠物 | `other` |
| #50 | [FSMargoo/dsh-at-file](https://github.com/FSMargoo/dsh-at-file) | ⭐ 503 | ✅ | Codex-style @file mentions for DeepSeek Harness: search workspace files in the composer and attach their path to prompts. | `ui-panel` |

See [docs/index.md](docs/index.md) for the full sortable list, [docs/categories/](docs/categories/) per category, [docs/trending.md](docs/trending.md) for newest, [docs/maintained.md](docs/maintained.md) for recently active, [docs/growth.md](docs/growth.md) for fastest growing.

<!-- END:BOT -->












































































































































