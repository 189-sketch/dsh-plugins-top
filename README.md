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

Snapshot: `2026-08-19T06:42:14.285Z` · Indexed: **7666** repos · Schema: v1 · Query: `topic:dsh-plugin (star-range sharded) + manual-additions`

Verification: ✅ 6685 verified · 🟡 120 likely · ❌ 860 filtered out

## Top 50 by stars (verified plugins only)

| # | Repo | Stars | Verified | Description | Category |
|---|---|---|---|---|---|
| #1 | [tt-a1i/archify](https://github.com/tt-a1i/archify) | ⭐ 14308 | ✅ | Agent skill for beautiful, verifiable architecture, workflow, sequence, data-flow, and lifecycle diagrams—self-contained HTML with motion and crisp export. | `skill` |
| #2 | [MemTensor/MemOS](https://github.com/MemTensor/MemOS) | ⭐ 10780 | ✅ | Self-evolving memory OS for LLM & AI Agents: ultra-persistent memory, hybrid-retrieval, and cross-task skill reuse, with 35.24% token savings and DeepSeek Harness support. | `skill` |
| #3 | [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) | ⭐ 9351 | ✅ | A curated list of plugins for DeepSeek Harness (dsh) · DeepSeek Harness 插件精选列表 | `other` |
| #4 | [Q00/ouroboros](https://github.com/Q00/ouroboros) | ⭐ 5565 | ✅ | Agent OS: the agent gets smarter on its own. We just hold the line: the grading command and expected result never make it into the success contract we hand it. Interview-gated, staged evaluation, budgeted evolution loop. MCP server, 13 runtimes: Claude Code, Codex CLI, Gemini CLI, OpenCode, Copilot, Kiro and more. | `tool` |
| #5 | [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) | ⭐ 4704 | ✅ | Plugin and skin collection for DeepSeek Harness (DSH) Web UI - task board, git graph, right-side panel, remote mobile UI, pet, live token stats, and skin center. | `skin` |
| #6 | [xiaobright/dsh-anchored-standard](https://github.com/xiaobright/dsh-anchored-standard) | ⭐ 3589 | ✅ | Two-phase DeepSeek Harness preset: Minimal-aligned bootstrap, then full Standard tools (Project2 98/99) | `tool` |
| #7 | [liustack/modlens](https://github.com/liustack/modlens) | ⭐ 3167 | ✅ | The first vision plugin for DeepSeek Harness, and the vision bridge for every text-only coding agent. Paste an image, get structured JSON evidence (OCR, layout, semantics). \| 全网最强 DeepSeek Harness 外挂视觉插件，为 DeepSeek、GLM 等纯文本模型外挂视觉能力，粘贴图片即得结构化 JSON 证据（OCR、版面、语义）。 | `skill` |
| #8 | [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) | ⭐ 2241 | ✅ | 开放的侧边栏底座，支持三方拓展注册新侧边栏页面。内置文件渲染编辑/终端/Git/子代理页面 ｜ Open sidebar foundation, supports third-party extensions to register new sidebar pages. Built-in file rendering/editing, terminal, Git, and sub-agent pages. | `ui-panel` |
| #9 | [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) | ⭐ 2020 | ✅ | DSH 官方公众号收录的 TUI 补位插件：Claude Code 风，鲸鱼顶栏/实时状态/流式思考/双击 Esc 回滚/上下文进度+TPS。npm 一键装。  DSH official WeChat featured TUI plugin — Claude Code style: whale bar, live status, streaming thoughts, double-Esc rollback, context bar + TPS. npm one-click. | `skill` |
| #10 | [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) | ⭐ 1410 | ✅ | DSH Web 鲸鱼娘皮肤系列(深海女仆工坊 maid-atelier)——CC BY-NC-SA 4.0 | `skin` |
| #11 | [Tencent/BrowserSkill](https://github.com/Tencent/BrowserSkill) | ⭐ 1157 | ✅ | Let AI agents use your real, logged-in browser without interrupting your work. CLI + extension for browser automation across any shell-capable AI agent. | `skill` |
| #12 | [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) | ⭐ 1115 | ✅ | The plugin market inside DeepSeek Harness — browse, search, one-click install · DSH 可视化插件市场 | `ui-panel` |
| #13 | [agentrq/agentrq](https://github.com/agentrq/agentrq) | ⭐ 1078 | ✅ | AgentRQ: Human-in-loop realtime conversational task manager for AI Agents. Self-hosted! Control your own agents from wherever you want Mobile, Web, Desktop. Designed to work well with your own Claude subscriptions and any harness. | `other` |
| #14 | [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) | ⭐ 1064 | ✅ | Make AI coding agents architecture-aware: baseline-first, evidence-verified, drift-checked, and safe across long tasks. | `skill` |
| #15 | [Anil-matcha/awesome-dsh-plugin](https://github.com/Anil-matcha/awesome-dsh-plugin) | ⭐ 942 | ✅ | A curated list of plugins for DeepSeek Harness (dsh) - DeepSeek Harness plugin ecosystem | `ui-panel` |
| #16 | [mindscale-noah/MindMemOS](https://github.com/mindscale-noah/MindMemOS) | ⭐ 938 | ✅ |  | `skill` |
| #17 | [toby-bridges/api-relay-audit](https://github.com/toby-bridges/api-relay-audit) | ⭐ 791 | ✅ | Local security audit for AI API relays and LLM proxies: detects prompt injection, model substitution, tool-call rewriting, SSE anomalies, error leakage, and Web3 wallet risks. | `tool` |
| #18 | [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) | ⭐ 780 | ✅ | Eyes for text-only DeepSeek Harness agents: built-in free vision chain (no key) + pixel-level vision tools (Q&A, grounding, crop, pixel diff, colors, OCR, SVG trace, cutout, screenshots). One-command install, no Python, image turns work like ordinary tool-calling turns. | `provider` |
| #19 | [0xsline/awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness) | ⭐ 739 | ✅ | DeepSeek Harness (DSH) ecosystem: curated plugins, tools, and infrastructure from dsh-external/hub and the public dsh-plugin topic. | `tool` |
| #20 | [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) | ⭐ 719 | ✅ | [dsh]为纯文本模型设计更强大的视觉工具箱：安装免费使用、粘贴图片直接识别、多张图片问答、截图到前端UI 还原等｜DeepSeek Harness-native integration for agent-vision-toolkit: image Q&A, long-screenshot OCR, UI restoration, grounding, pixel diff, Artifacts, and Web UI. | `skill` |
| #21 | [ccch1mneyyy/working-activity](https://github.com/ccch1mneyyy/working-activity) | ⭐ 653 | ✅ | Lively Working-line extension for pi CLI and DSH | `other` |
| #22 | [sandbaseai/sandbase-harness](https://github.com/sandbaseai/sandbase-harness) | ⭐ 621 | ✅ | Open-source CMA-compatible agent runtime for any model, with MCP tools, sandboxed sessions, audit, replay, and a local console. Includes a native DeepSeek Harness bundle over stdio MCP. | `skill` |
| #23 | [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) | ⭐ 582 | ✅ | AgentTeams plugin for DeepSeek Harness | `ui-panel` |
| #24 | [adoresever/graph-memory](https://github.com/adoresever/graph-memory) | ⭐ 552 | ✅ | Deepseek Harness、Openclaw知识图谱记忆插件。2026年4月受邀发布在清华大学讨论会。Knowledge Graph + Memory；Knowledge Graph Context Engine for OpenClaw — extracts structured triples from conversations, compresses context 75%, enables cross-session experience reuse | `other` |
| #25 | [Electricitysheep/dsh-handbook](https://github.com/Electricitysheep/dsh-handbook) | ⭐ 509 | ✅ | DeepSeek Harness (dsh) 从 0 到 1 深度手册：安装/插件开发/性能调优/实测案例/同模型多 Agent 实测对比（中文 + 英文 PDF） | `other` |
| #26 | [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) | ⭐ 504 | ✅ | 把 DSH 变成 2005 年门户网站｜Parody ads, fake games, and popups for the DSH Web UI | `ui-panel` |
| #27 | [vibeinging/deepseek-harness-desktop-app](https://github.com/vibeinging/deepseek-harness-desktop-app) | ⭐ 487 | 🟡 | DeepSeek Harness Desktop App: a local AI desktop workspace for DSH Sessions, projects, files, web research, plugins, and Office artifacts. | `other` |
| #28 | [superdesigndev/treg](https://github.com/superdesigndev/treg) | ⭐ 485 | ✅ | OpenRouter for agent tools. Join community here: https://discord.gg/6mQYYfFMAn | `tool` |
| #29 | [mnemon-dev/mnemon](https://github.com/mnemon-dev/mnemon) | ⭐ 484 | ✅ | LLM-supervised persistent memory for AI agents — graph-based recall, cross-session knowledge, single binary. Works with DeepSeek Harness, Claude Code, OpenClaw, and any agent runtime. | `tool` |
| #30 | [syncable-dev/memtrace-public](https://github.com/syncable-dev/memtrace-public) | ⭐ 455 | ✅ | Structural memory for AI coding agents. Bi-temporal graph, MCP-native, zero LLM calls. Cursor · Claude Code · Codex · DeepSeek Harness · Hermes · VS Code · Windsurf. | `other` |
| #31 | [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | ⭐ 433 | ✅ | The design skill for Claude Code, Cursor and any coding agent. Stop shipping AI-slop UI: turn it into shippable, tasteful frontend. Install: npx skills add superdesigndev/superdesign-skill. Powered by superdesign.dev | `skill` |
| #32 | [bowenliang123/dsh-context](https://github.com/bowenliang123/dsh-context) | ⭐ 418 | ✅ | Best DeepSeek Harness plugin for context insight and management, with context dashboard / browser and context command, for context statistics, composition, breakdown, evolution details, understanding how the context is made of, and how it evolves. 一站式 DeepSeek Harness 上下文可视化插件，Context 面板及浏览器与 Context 命令，透视上下文组成、演进、压缩、剪枝等事件与动作。 | `ui-panel` |
| #33 | [Ikalus1988/MisakaNet](https://github.com/Ikalus1988/MisakaNet) | ⭐ 408 | ✅ | 📚 A zero-dependency, git-backed micro-lesson library for AI Agents to asynchronously share and search verified debugging experience. Python stdlib only. \| https://misakanet.org | `other` |
| #34 | [omdsh-dev/dsh-at-file](https://github.com/omdsh-dev/dsh-at-file) | ⭐ 397 | ✅ | Codex-style @file mentions for DeepSeek Harness: search workspace files in the composer and attach their path to prompts. | `ui-panel` |
| #35 | [EthanYoQ/AI-Novel-Writer](https://github.com/EthanYoQ/AI-Novel-Writer) | ⭐ 394 | ✅ | 本地优先 AI 小说创作工作台，提供 Windows/macOS 桌面版与 DeepSeek Harness 插件开发预览，支持角色、大纲、章节蓝图、审稿修稿和本地模型。 | `other` |
| #36 | [linhay/harmony-next.skills](https://github.com/linhay/harmony-next.skills) | ⭐ 330 | ✅ | 🚀 Expert guidance for HarmonyOS NEXT (API 12+) development. Covers IDE operations, performance tuning, architecture (HAP/HAR/HSP), and automation testing. | `other` |
| #37 | [text2future/flowix](https://github.com/text2future/flowix) | ⭐ 321 | ✅ | Notes for you, Memory for your agents. / 内置 Deepseek harness Agent / 适用 办公 & 写作 & Coding | `other` |
| #38 | [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) | ⭐ 306 | ✅ | dsh plugin: Chrome sidebar extension that lets DeepSeek Harness operate your browser directly, no vision capabilities required. 一款 Chrome 侧边栏扩展程序，可让 DeepSeek Harness 直接操控您的浏览器，无需视觉能力。 | `ui-panel` |
| #39 | [fufankeji/deepseek-harness-studio](https://github.com/fufankeji/deepseek-harness-studio) | ⭐ 306 | 🟡 | DeepSeek Harness 零代码桌面端｜一键启动，支持 Windows 与 macOS；内置插件发现、热点插件推送、一键安装与管理、AI 智能推荐和视觉增强。 | `tool` |
| #40 | [WYH66666666/DSH-Transparent-UI-Plugin](https://github.com/WYH66666666/DSH-Transparent-UI-Plugin) | ⭐ 303 | ✅ | 是一层高自由度的玻璃质感主题，套在 DeepSeek Harness 网页端。顶栏、侧边栏、输入框、统计行、轨迹视图都成了磨砂玻璃片。玻璃模糊度、磨砂度、背景（流体或自定义壁纸，壁纸还能单独调模糊和磨砂）全都能在设置卡片里自由调节。关掉开关就回到原生界面，不改 DSH 任何一行源码。 | `skin` |
| #41 | [hust-open-atom-club/oh-dsh](https://github.com/hust-open-atom-club/oh-dsh) | ⭐ 255 | ✅ |  一套 DSH runtime，Desktop、Web 与 TUI 三种开发体验。 | `ui-panel` |
| #42 | [vlln/whale-girl](https://github.com/vlln/whale-girl) | ⭐ 242 | ✅ | DSH Web GUI 桌面宠物插件（QQ 宠物形态）：右下角悬浮、可拖拽/投喂/玩耍的积累型伙伴。 | `ui-panel` |
| #43 | [zhoushoujianwork/easyeda-agent](https://github.com/zhoushoujianwork/easyeda-agent) | ⭐ 235 | ✅ | 嘉立创EDA专业版(EasyEDA Pro)自动化：给 AI harness 装上画板的「手」—— 一套 typed 原理图/PCB 动作，CLI / Agent Skill / stdio MCP 三形态融合接入。承接嘉立创「不以卖板赚钱，以培养中国工程师为己任」 \| EasyEDA Pro automation: the hands of your AI harness — typed schematic/PCB actions via CLI, Agent Skill and stdio MCP. | `skill` |
| #44 | [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) | ⭐ 227 | ✅ | GenUI for DeepSeek Harness: interactive UI components rendered inline in assistant replies via the dsh-ui fence — layout, charts, plots, forms, quizzes, mermaid, 3D scenes, and an action event loop back to the model. Ships the fence-teaching host plugin, the browser renderer (client half), and the genui skill. | `skill` |
| #45 | [mrpulor-gh/nuphus-mcp](https://github.com/mrpulor-gh/nuphus-mcp) | ⭐ 226 | ✅ | Desktop automation MCP server — computer use for any AI agent: control screen, windows, mouse/keyboard, and Chrome via Model Context Protocol (stdio) | `other` |
| #46 | [huiliyi37/dsh-tianshu-tui](https://github.com/huiliyi37/dsh-tianshu-tui) | ⭐ 217 | ✅ | 官方 DeepSeek Harness 的交互式终端 UI 插件：自研 ANSI 极简渲染核心（由作者自己的开源项目天枢 Tui 演进）、流式 Markdown/工具卡、多会话 tab、16+ 主题、slash 命令与选择器、输入历史与本地偏好持久化、LSP 诊断、成本统计、启动自更新。纯展示层。 | `skin` |
| #47 | [op7418/pilot-harness](https://github.com/op7418/pilot-harness) | ⭐ 196 | ✅ | Pilot Harness — a CodePilot-inspired desktop client and plugin suite for DeepSeek Harness on macOS, Windows, and Linux. | `tool` |
| #48 | [shaobeichen/dsh-pocket](https://github.com/shaobeichen/dsh-pocket) | ⭐ 187 | ✅ | 把 DeepSeek Harness 装进你的口袋：电脑上跑 dsh web，手机扫码即同步访问（局域网 + 公网，实时同屏） | `ui-panel` |
| #49 | [csyangwen/dsh-memory-evolve](https://github.com/csyangwen/dsh-memory-evolve) | ⭐ 187 | ✅ | 为 DeepSeek Harness 带来「跨会话长期记忆 + 后台自我进化」能力的纯插件实现：五轨记忆 · git 分支感知 · 回合内自我审查 · 技能自我进化与技能管理器 · 四轨待办 · COI 调度 · 会话广播 · 会话搜索 · 提示词管理器 · 临时信息便签——零核心修改、零运行时依赖，随装随用、卸载即净。 | `ui-panel` |
| #50 | [Nagi-ovo/dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) | ⭐ 182 | ✅ | 在 DSH 对话中生成交互式可视化｜Render model-generated interactive cards inside DSH conversations | `skill` |

See [docs/index.md](docs/index.md) for the full sortable list, [docs/categories/](docs/categories/) per category, [docs/trending.md](docs/trending.md) for newest, [docs/maintained.md](docs/maintained.md) for recently active, [docs/growth.md](docs/growth.md) for fastest growing.

<!-- END:BOT -->



























