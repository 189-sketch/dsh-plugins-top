---
name: dsh-plugins-top effort
type: wayfinder:map
status: charting
tracker: local-markdown
root: .wayfinder
created: 2025
---

# dsh-plugins-top effort

> 本文件就是 effort 的「地图」。所有子票为 `.wayfinder/tickets/<name>.md`，用 `name` 引用，不用 issue 编号。

## Destination

一个独立的开源仓库 **dsh-plugins-top**，自动汇集所有 GitHub.com 上公开声明自己为 DeepSeek Harness (DSH) 插件的仓库，按 stars（并辅以其它客观指标）维护多维度排行榜——总榜、分类榜、新星榜、增速榜、活跃榜——以 Markdown 形式落盘到 `docs/`，由 GitHub Actions 按 schedule 持续刷新，可选用 GitHub Pages 渲染成静态站点。

仓库即产品：README + `data/` + `docs/` + workflow 是它的全部交付。

## Notes

- **领域**：开源 DSH 生态 / GitHub 数据采集 / 静态站点生成。
- **工作目录**：`E:\agent\dsh-plugins-top`，目前为空，尚未 git init；执行阶段的脚手架与代码不属于本地图。
- **本会话审批**：policy=`never`，文件 I/O 不再弹窗；wayfinder 自律仍生效——规划优先，不绕去写脚本。
- **加载技能**：wayfinder（本张）；后续按票的需要可引入 find-skills、openspec-*、`/grilling`、`/domain-modeling`、`/research`、`/prototype`。
- **长期偏好**：
  - 仅采公开 github.com 仓库；不支持 GHE / 私有 / 非 GitHub 来源。
  - 静态产物 + Actions = 全部交付面；禁止引入自建服务 / DB / 自研 API。
  - 自动发现优先于人工运营；self-submit PR 作为人工兜底。
  - 排名完全客观（stars、forks、pushed_at 等），不引入评分 / 评论 / 投票。
- **追踪器约定**：local-markdown fallback。地图在 `.wayfinder/map.md`；子票在 `.wayfinder/tickets/`；研究子 agent 的原始笔记在 `.wayfinder/notes/`。

## Decisions so far

<!-- 一票一行：gist + 链接。地图本身只是索引，决议正文在子票里。 -->

_(none yet — 地图刚开，下一张关闭时这里才会长出第一行)_

## Frontier（即可启动的子票）

执行顺序参考「依赖图小节」：未阻塞、谁都能接的票在前。

| 票 | 类型 | 状态 | 依赖 | 摘要 |
|---|---|---|---|---|
| [T01 — GitHub Discovery Strategy](tickets/t01-github-discovery-strategy.md) | research (AFK) | open | — | GitHub Search API 怎么稳定枚举 dsh-plugin 仓库 |
| [T03 — Stack and CI/CD Shape](tickets/t03-stack-and-cicd-shape.md) | grilling (HITL) | open | — | 语言/测试栈/CI 镜像/cron/Pages 选择 |
| [T02 — Classification Taxonomy](tickets/t02-classification-taxonomy.md) | grilling (HITL) | open | T01 | 分类体系与判定来源 |
| [T04 — Data Schema and Snapshot Policy](tickets/t04-data-schema-snapshot-policy.md) | grilling (HITL) | open | T01, T02 | `data/plugins.json` schema 与 history 保留 |
| [T05 — Anti-Abuse and MVP DoD](tickets/t05-anti-abuse-mvp-acceptance.md) | grilling (HITL) | open | T01 | 防滥用与首期 Definition of Done |

## Not yet specified

<!-- 范围内的雾：能感觉到前面有决策/调查，但此刻还说不确切，所以先不入票。 -->

- GitHub Search API 查询表达式的确切语法与认证策略（topic 单源 / topic+label+关键字 双源 / 只接受 self-submit whitelist）。
- 「分类」字段从何读——仓库根的 `SKILL.md`、`package.json` 依赖项、还是 self-declared topic？组合权重？
- 站点深度——仅仓库内 `.md`，还是 Pages 渲染并加客户端过滤。
- 调度粒度——cron 表达式、并发上限、单次最大巡检仓库数。
- 数据契约演进规则——纯加性 vs 带迁移版本号。
- 反作弊——star 农场判定阈值、是否要求 main 分支活跃、manual review 的最小尺度。
- 首期 Definition of Done——最少多少真实 dsh-plugin 仓库、最少几条分类榜、是否需 Pages 部署成功。
- 许可证策略——只收 MIT/Apache-2.0，还是任意 OSS-friendly。
- 国际化——README 与榜单是否双语或按 locale 切榜。
- 与 `dsh-host-plugin-inventory` 的关系——并列、镜像、还是消费其输出。

## Out of scope

<!-- 本 effort 主动排除：目的地之外的边界；不再归位。 -->

- 实现 DSH 插件本体——本仓库只排名别人的插件。
- 任何评分、点赞、评论系统——纯客观指标。
- 私有 GitHub / GHE / 自建 Gitea 数据。
- 非 GitHub 来源（GitLab、Bitbucket 等）。
- 自建服务端 / 数据库 / 自定义 API。
