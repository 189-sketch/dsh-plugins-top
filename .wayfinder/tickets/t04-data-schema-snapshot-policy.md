---
name: T04 — Data Schema and Snapshot Policy
type: wayfinder:grilling
status: open
blockedBy: [T01, T02]
---

# T04 — Data Schema and Snapshot Policy

## Question

`data/` 的具体契约与保留策略怎么定？

要敲定的事：

- **`data/plugins.json` 形状**：
  - 必需字段：`repo` (`owner/name`)、`stars`、`pushed_at`、`categories[]`、`license`、`description`、`homepage?`、`topics[]`、`fetched_at`。
  - 可选字段：`downloads`、`used_by_count`、`first_seen_at`、`last_released_at?`、`funding?`。
  - 元数据字段：schema 版本号（`schema_version`，整数）、扫描元数据（`snapshot_at`、`source_query`）。
- **分类字段类型**：单字符串（`category: "skill"`）、数组（`categories: ["skill","tool"]`）、还是带主次的对象（`{ primary: "skill", secondary: ["tool"] }`）。
- **history 策略**：
  - `data/history/YYYY-MM-DD.json` 每日一份、永久保留、近 90 天全量 + 之前按周聚合。
  - 或只保留 `latest` + 过去 7 份细粒度 + 月份聚合。
- **演进规则**：纯加性演进，是否允许大版本破坏？是否需要 `schema_version` + 兼容垫片。
- **签发与可验证**：是否对每次 snapshot commit 走 GPG 签名/sigstore？还是仅 commit-author = `dsh-bot` 即可。
- **README / 各类榜单如何引用**：超链接 `?v=<snapshot>`、相对路径 `../data/plugins.json`、还是每次刷新时把榜单 md 重新渲染。
- **JSON Schema 验收**：用 JSON Schema / Zod / Cerberus 哪个做下游消费方的契约校验？

## Resolution

_resolved 时把 JSON Schema 的草案落到 `.wayfinder/notes/T04-schema-sketch.json`，并把策略写进主地图 Notes。_

## Source (resolve 时填)

_Star history 一类公开的 GitHub 数据存储设计借鉴。_
