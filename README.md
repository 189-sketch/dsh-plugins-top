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

Snapshot: `2026-10-22T14:57:23.219Z` · Indexed: **6180** repos · Schema: v1 · Query: `topic:dsh-plugin (star-range sharded) + manual-additions`

Verification: ✅ 5574 verified · 🟡 90 likely · ❌ 516 filtered out

## Top 50 by stars (verified plugins only)

| # | Repo | Stars | Verified | Description | Category |
|---|---|---|---|---|---|
| #1 | [Ebony-Vinyl/dsh-our-free-model](https://github.com/Ebony-Vinyl/dsh-our-free-model) | ⭐ 36282 | ✅ | 在 dsh 里装上这个插件即可，无需登录、注册或填 API Key，就能使用包括 DeepSeek V4.1 Flash、Kimi K3 在内的前沿模型——完全免费，不限量。 All you do is install this plugin in dsh: no login, no sign-up, no API key — the frontier models are just there, DeepSeek V4.1 Flash and Kimi K3 among them. Completely free, with no usage cap. | `provider` |
| #2 | [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) | ⭐ 20092 | ✅ | A curated list of plugins for DeepSeek Harness (dsh) · DeepSeek Harness 插件精选列表 | `other` |
| #3 | [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) | ⭐ 16175 | 🟡 | DSHDesktop：DeepSeek Harness Desktop / DeepSeek Harness 桌面版 | `skin` |
| #4 | [MemTensor/MemOS](https://github.com/MemTensor/MemOS) | ⭐ 12028 | ✅ | Self-evolving memory OS for LLM & AI Agents: ultra-persistent memory, hybrid-retrieval, and cross-task skill reuse, with 35.24% token savings and DeepSeek Harness support. | `skill` |
| #5 | [ranxianglei/billion-context](https://github.com/ranxianglei/billion-context) | ⭐ 2384 | ✅ | A context-compression plugin for month-long single sessions (billions of tokens) ,small context windows (a 100K context is enough) and token savings (5x fewer tokens) .上下文压缩插件，月级长会话会话， 兼顾小窗口(100k上下文足矣)省token(省5倍token) . billion-context is all you need | `ui-panel` |
| #6 | [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) | ⭐ 2353 | ✅ | DeepSeek Harness 的 Agent Teams 多智能体协作插件，支持多个 AI Agent 组成团队，协同完成复杂任务，实现任务分配、并行执行、成员通信与团队协作。 AgentTeams plugin for DeepSeek Harness | `provider` |
| #7 | [xmanrui/dsh-im](https://github.com/xmanrui/dsh-im) | ⭐ 2321 | ✅ | 通过扫码或机器人凭据把IM机器人接入DeepSeek Harness（支持飞书、微信、钉钉、企业微信、QQ、Slack、Telegram、Discord和WhatsApp）。 Connect IM bots to DeepSeek Harness via QR code or credentials (9 channels). | `ui-panel` |
| #8 | [shaobeichen/dsh-pocket](https://github.com/shaobeichen/dsh-pocket) | ⭐ 2236 | ✅ | 把 DeepSeek Harness 装进你的口袋：电脑上跑 dsh web，手机扫码即同步访问（局域网 + 公网，实时同屏）Put DeepSeek Harness in your pocket: run dsh web on your computer and access it synchronously by scanning a QR code on your phone (LAN + public network, real‑time screen mirroring) | `ui-panel` |
| #9 | [elysia395/dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine) | ⭐ 1897 | ✅ | 把本机 Wallpaper Engine 的壁纸搬进 DSH 网页界面：场景壁纸由内置 MIT 开源引擎 WebWallGL 实时 WebGL 渲染（粒子 / puppet 骨骼 / SceneScript / 音频反应 / 鼠标交互），失败自动降级内嵌 MP4 与场景静态帧；Web 壁纸严格沙箱 + WE API；iOS 风格液态玻璃 UI 高度自定义，遮挡暂停省电、ffmpeg 帧率上限转码、系统音频频谱与 Now Playing、自定义上传与自动轮播；设置存宿主端，对 agent 零 token 开销。Windows / macOS / Linux 三平台原生（同一个包、同一条命令）。 | `skin` |
| #10 | [kenryu42/cc-safety-net](https://github.com/kenryu42/cc-safety-net) | ⭐ 1745 | ✅ | A pre-execution guard for AI coding agents. It blocks destructive Git and file system commands, plus common attempts to access sensitive files, before a tool call runs. Supports Amp Code, Antigravity CLI, Claude Code, Codex, Cursor, DeepSeek Harness, Devin CLI, GitHub Copilot CLI, Grok Build, Hermes Agent, Kimi Code, OpenClaw, OpenCode, and Pi. | `tool` |
| #11 | [mmparko/dsh-purge](https://github.com/mmparko/dsh-purge) | ⭐ 1598 | ✅ | DeepSeek Harness 破甲 (mirror of YuJunZhiXue/dsh-purge) — 上游即将删库，此为本仓库全量镜像：含全部分支/73 个 tag/完整提交历史。原作者署名与二开要求见 README 署名章节。 | `ui-panel` |
| #12 | [hyhmrright/brooks-lint](https://github.com/hyhmrright/brooks-lint) | ⭐ 1540 | ✅ | AI code reviews grounded in 12 classic engineering books — decay risk diagnostics with book citations, severity labels, and 6 analysis modes including full-sweep auto-fix | `skill` |
| #13 | [Devin-AXIS/deepseek-design](https://github.com/Devin-AXIS/deepseek-design) | ⭐ 1494 | ✅ | DeepSeek Harness 可编辑设计系统：AI 生成、可视化编辑、模板市场与 PPT｜Native Design & PPT Studio for DeepSeek Harness. | `other` |
| #14 | [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) | ⭐ 1373 | ✅ | Make AI coding agents architecture-aware: baseline-first, evidence-verified, drift-checked, and safe across long tasks. | `skill` |
| #15 | [vshulcz/deja-vu](https://github.com/vshulcz/deja-vu) | ⭐ 1285 | ✅ | Coding agent memory for Claude Code, Codex, Cursor and 39 more, built from the session history already on your disk. Local search, MCP and hooks, no LLM, one Go binary. | `ui-panel` |
| #16 | [0xsline/awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness) | ⭐ 1241 | ✅ | DeepSeek Harness (DSH) ecosystem: curated plugins, tools, and infrastructure from dsh-external/hub and the public dsh-plugin topic. | `tool` |
| #17 | [flizzywine/dsh-tavern](https://github.com/flizzywine/dsh-tavern) | ⭐ 1208 | ✅ | 基于DSH的Agent酒馆。类酒馆文字游戏Agent。兼容SillyTavern生态，人物卡直接导入就能玩。更快、更稳、更鲜活。所有模型都能用。手机也能玩。 | `skin` |
| #18 | [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) | ⭐ 1164 | ✅ | Eyes for text-only DeepSeek Harness agents: built-in free vision chain (no key) + pixel-level vision tools (Q&A, grounding, crop, pixel diff, colors, OCR, SVG trace, cutout, screenshots). One-command install, no Python, image turns work like ordinary tool-calling turns. | `provider` |
| #19 | [agentrq/agentrq](https://github.com/agentrq/agentrq) | ⭐ 1163 | ✅ | AgentRQ: Human-in-loop realtime conversational task manager for AI Agents. Self-hosted! Control your own agents from wherever you want Mobile, Web, Desktop. Designed to work well with your own Claude subscriptions and any harness with ACP support. | `skill` |
| #20 | [TencentCloudBase/CloudBase-AI-Toolkit](https://github.com/TencentCloudBase/CloudBase-AI-Toolkit) | ⭐ 1142 | ✅ | Backend for AI coding agents on CloudBase — database, auth, functions via Plugin, Skills & MCP. | `skill` |
| #21 | [Miaotofu01/Study-Mate](https://github.com/Miaotofu01/Study-Mate) | ⭐ 1138 | ✅ | 你的AI学习搭档：定路线、讲知识、做项目，边学边做，学透一门科目 | `ui-panel` |
| #22 | [sixtysevenlf/dsh-blender-plugin](https://github.com/sixtysevenlf/dsh-blender-plugin) | ⭐ 1074 | ✅ | DSH × Blender 直连实时插件：15 个模型工具让 AI 驱动 GUI Blender；v2.5 活动状态置顶并可一键暂停 AI，原生选中/集合/子元素直送 DSH，随包建模 skill，支持 WSL / Windows / macOS。 | `skill` |
| #23 | [mindscale-noah/MindMemOS](https://github.com/mindscale-noah/MindMemOS) | ⭐ 918 | ✅ |  | `skill` |
| #24 | [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) | ⭐ 903 | ✅ | [dsh]为纯文本模型设计更强大的视觉工具箱：一行安装使用、粘贴图片直接识别、多张图片问答、截图到前端UI 还原等｜DeepSeek Harness-native integration for agent-vision-toolkit: image Q&A, long-screenshot OCR, UI restoration, grounding, pixel diff, Artifacts, and Web UI. | `skill` |
| #25 | [Electricitysheep/dsh-handbook](https://github.com/Electricitysheep/dsh-handbook) | ⭐ 890 | ✅ | DeepSeek Harness (dsh) 从 0 到 1 深度手册：安装/插件开发/性能调优/实测案例/同模型多 Agent 实测对比（中文 + 英文 PDF） | `other` |
| #26 | [toby-bridges/api-relay-audit](https://github.com/toby-bridges/api-relay-audit) | ⭐ 887 | ✅ | Local security audit for AI API relays and LLM proxies: detects prompt injection, model substitution, tool-call rewriting, SSE anomalies, error leakage, and Web3 wallet risks. | `tool` |
| #27 | [omdsh-dev/dsh-browser](https://github.com/omdsh-dev/dsh-browser) | ⭐ 884 | ✅ | Chrome sidebar extension that lets DeepSeek Harness operate your browser directly, no vision capabilities required. 一款 Chrome 侧边栏扩展程序，可让 DeepSeek Harness 直接操控您的浏览器，无需视觉能力。 | `provider` |
| #28 | [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | ⭐ 878 | ✅ | The design skill for Claude Code, Cursor and any coding agent. Stop shipping AI-slop UI: turn it into shippable, tasteful frontend. Install: npx skills add superdesigndev/superdesign-skill. Powered by superdesign.dev | `skill` |
| #29 | [LiPu-jpg/Openwrite](https://github.com/LiPu-jpg/Openwrite) | ⭐ 866 | ✅ | dsh-Openwrite：OpenWrite 的 DeepSeek Harness 小说创作插件，含统一创作 Agent、90 个小说工具、原生工作台与标准审稿 DAG | `other` |
| #30 | [liustack/modsearch](https://github.com/liustack/modsearch) | ⭐ 805 | ✅ | 🥇 The strongest free web search plugin for DeepSeek Harness, and the search bridge for every model without native web access. Free, no signup, no API key. Ask the web or X, get structured JSON evidence. \| 🥇 全网最强的 DeepSeek Harness 免费联网搜索插件，免费免注册免 API key。为不能联网的模型补上搜索，问网页或 X，拿回结构化 JSON 证据（搜索、抓取、引用）。 | `skill` |
| #31 | [zhoushoujianwork/easyeda-agent](https://github.com/zhoushoujianwork/easyeda-agent) | ⭐ 782 | ✅ | 嘉立创EDA专业版(EasyEDA Pro)自动化：给 AI harness 装上画板的「手」—— 一套 typed 原理图/PCB 动作，CLI / Agent Skill / stdio MCP 三形态融合接入。承接嘉立创「不以卖板赚钱，以培养中国工程师为己任」 \| EasyEDA Pro automation: the hands of your AI harness — typed schematic/PCB actions via CLI, Agent Skill and stdio MCP. | `skill` |
| #32 | [Aisland-SJL/dsh-worktable](https://github.com/Aisland-SJL/dsh-worktable) | ⭐ 779 | ✅ | 🖥️ Agent-project workbench for DeepSeek Harness — sidebar app drawer + dockable split workspace + a live control room watching every project. | `ui-panel` |
| #33 | [SeaOf0/dsh-redteam-model](https://github.com/SeaOf0/dsh-redteam-model) | ⭐ 740 | ✅ | 基于dsh web实现的多种模式，目的是服务于redteam进行授权的安全研究，覆盖渗透测试、红队评估、代码审计等范围领域，请勿用于非法行为。（允许二开，赋予模块各位自己的业务逻辑，方法论只有自己熟练的才好用，好的方法论=好的生态） | `ui-panel` |
| #34 | [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) | ⭐ 733 | ✅ | GenUI for DeepSeek Harness: interactive UI components rendered inline in assistant replies via the dsh-ui fence — layout, charts, plots, forms, quizzes, mermaid, 3D scenes, and an action event loop back to the model. Ships the fence-teaching host plugin, the browser renderer (client half), and the genui skill. | `skill` |
| #35 | [myYangyunfan/dsh_desktop](https://github.com/myYangyunfan/dsh_desktop) | ⭐ 722 | ✅ | DeepSeek Harness (dsh) Windows desktop client - bundled Node.js + dsh CLI, one-click launch | `other` |
| #36 | [whitelonng/dshcode](https://github.com/whitelonng/dshcode) | ⭐ 703 | 🟡 | Community desktop companion for DeepSeek Harness — one-click Electron app for macOS and Windows | `tool` |
| #37 | [beiyege-01/dsh-voice-ai-girlfriend](https://github.com/beiyege-01/dsh-voice-ai-girlfriend) | ⭐ 697 | ✅ | 语音 AI 女友（Voice AI girlfriend for DeepSeek Harness）：Whisper 语音输入 + Qwen3-TTS 声音克隆 + 句子级流式朗读 + 数字人动画窗。插话/排队双模式，说话即打断。 | `other` |
| #38 | [fufankeji/deepseek-harness-studio](https://github.com/fufankeji/deepseek-harness-studio) | ⭐ 692 | 🟡 | DeepSeek Harness 零代码桌面端｜一键启动，支持 Windows 与 macOS；内置插件发现、热点插件推送、一键安装与管理、AI 智能推荐和视觉增强。 | `tool` |
| #39 | [Nagi-ovo/dsh-ads](https://github.com/Nagi-ovo/dsh-ads) | ⭐ 682 | ✅ | 把 DSH 变成 2005 年门户网站｜Parody ads, fake games, and popups for the DSH Web UI | `ui-panel` |
| #40 | [chenxiachan/thoughtdag](https://github.com/chenxiachan/thoughtdag) | ⭐ 676 | ✅ | Your thinking deserves a map: an infinite canvas where LLM conversations grow into an editable thought graph. Wires are the context. | `tool` |
| #41 | [ccch1mneyyy/working-activity](https://github.com/ccch1mneyyy/working-activity) | ⭐ 665 | ✅ | Lively Working-line extension for pi CLI and DSH | `other` |
| #42 | [shanliuling/dsh-image-gen](https://github.com/shanliuling/dsh-image-gen) | ⭐ 664 | ✅ |  可在对话内生成、编辑、对比图像；内置 500 + 提示词、图库、多模型工作流，支持 ComfyUI。AI image studio for DeepSeek Harness — generate, edit & compare images in chat, with 500+ prompts, gallery, multi-model workflows and ComfyUI. | `ui-panel` |
| #43 | [Clearailhc/clearai-dsh](https://github.com/Clearailhc/clearai-dsh) | ⭐ 664 | ✅ | ClearAI：以本体为纲的原生 DSH 插件 —— 经证据核验的研究长成可浏览的领域本体。 · ClearAI: an ontology-first DSH agent preset — evidence-checked research that grows into a domain ontology. | `ui-panel` |
| #44 | [chainbase-labs/Agentkey](https://github.com/chainbase-labs/Agentkey) | ⭐ 661 | ✅ | Connect your AI agent to the world — Web search, Social media, Crypto & On-chain data. One plugin, zero extra config. | `skill` |
| #45 | [adoresever/graph-memory](https://github.com/adoresever/graph-memory) | ⭐ 660 | ✅ | Deepseek Harness、Openclaw知识图谱记忆插件。2026年4月受邀发布在清华大学讨论会。Knowledge Graph + Memory；Knowledge Graph Context Engine for OpenClaw — extracts structured triples from conversations, compresses context 75%, enables cross-session experience reuse | `other` |
| #46 | [LivXue/dsh-plugin-shop](https://github.com/LivXue/dsh-plugin-shop) | ⭐ 655 | ✅ | The most comprehensive DeepSeek Harness plugin market — refreshed daily, sourced across the Internet, reviewed before publishing. | `other` |
| #47 | [anysearch-team/anysearch-dsh](https://github.com/anysearch-team/anysearch-dsh) | ⭐ 653 | ✅ | AnySearch web search provider and advanced search tools for DeepSeek Harness (DSH) | `tool` |
| #48 | [mnemon-dev/mnemon](https://github.com/mnemon-dev/mnemon) | ⭐ 652 | ✅ | LLM-supervised persistent memory for AI agents — graph-based recall, cross-session knowledge, single binary. Works with DeepSeek Harness, Claude Code, OpenClaw, and any agent runtime. | `tool` |
| #49 | [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) | ⭐ 643 | ✅ | Composable, view-based context for DeepSeek Harness. Pluggable sources and strategies, with layered memory and self-evolving skills out of the box. | `provider` |
| #50 | [sandbaseai/sandbase-harness](https://github.com/sandbaseai/sandbase-harness) | ⭐ 635 | ✅ | Local-first, self-hosted AI agent runtime and MCP bridge with sandboxed sessions, memory, credentials, audit/replay, and a local Console. | `skill` |

See [docs/index.md](docs/index.md) for the full sortable list, [docs/categories/](docs/categories/) per category, [docs/trending.md](docs/trending.md) for newest, [docs/maintained.md](docs/maintained.md) for recently active, [docs/growth.md](docs/growth.md) for fastest growing.

<!-- END:BOT -->






























































































































































































































































































































































































