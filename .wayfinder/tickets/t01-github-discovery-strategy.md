---
name: T01 — GitHub Discovery Strategy
type: wayfinder:research
status: open
blockedBy: []
---

# T01 — GitHub Discovery Strategy

## Question

通过 GitHub Search API，最可靠、最便宜地把「所有公开声明自己是 DSH 插件的 GitHub.com 仓库」枚举出来，应该用哪些查询与认证？

具体覆盖：

- `topic:dsh-plugin` 这条核心查询——确切语法、能否同义替换为 `topic:"dsh-plugin"`、`topic:deepseek-harness`，以及响应里能拿到的字段（`stargazers_count`、`pushed_at`、`topics[]`、`license`、`default_branch` 等）。
- 旁路信号：`label:dsh-plugin`（仓库级标签其实不会存在，只在 issue 上有，所以多半不可用——核实）、code search（关键字 `dsh-` / `deepseek-harness`）、`package.json` 依赖名（`@deepseek-ai/dsh-*` / `@liustack/dsh-*` / `@linxin666/dsh-*`）哪种成本最低。
- 配额成本：未认证 60/h、PAT 5000/h；GraphQL 一点成本相对 REST 的差异；以及「全量拉 + 每日增量」哪个更省。
- 分页策略：REST cursor vs GraphQL `pageInfo` 哪个更顺。
- 排除仓库的过滤：`archived`、`fork`、`private=false`、默认分支非 `main`/`master` 的处置。
- 二级拉取：拿到 owner/repo 列表后，是否还需额外 GraphQL 拉 `packageTopics` / `dependencyGraphManifests`？这步是免费的吗？

## Resolution

_resolved 时写一行（gist + link）。本地图以「读到一组确切的查询字符串 + 配额上限 + 异常处理」为「闭环」。_

## Source (resolve 时填)

- API 文档链接（如 GitHub Docs REST/GraphQL）
- 任何已知的实战 demo 或 rate-limit 计算脚本
