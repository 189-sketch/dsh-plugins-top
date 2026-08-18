---
name: T05 — Anti-Abuse Policy and MVP Definition of Done
type: wayfinder:grilling
status: open
blockedBy: [T01]
---

# T05 — Anti-Abuse Policy and MVP Definition of Done

## Question

排行榜怎么防被毒化？第一个可发布的版本满足什么条件才叫「上线」？

要敲定的事：

- **滥用检测**：
  - Star 农场/购买——是否需要结合 issue 数、commit 频、contributor 散布等启发式？还是裸采 stars 不做过滤？
  - 是否要求 main 分支活跃（如过去 180 天有 commit）。
  - 是否要求仓库至少 1 位 owner 与本项目无强关联。
  - 包名仿冒——`dsh-plugins`、`dsh-plugins-top`、`dsh-helper` 等是否进黑名单。
- **Self-submit**：是否允许个人提 PR 增补？需要哪些必填字段？review SLA？
- **剔除规则**：archived、disabled、license 非 OSI / 非 OSS-friendly 是否剔除？哪种 license 算合规（MIT / Apache-2.0 / BSD-x / ISC / MPL-2.0 / Unlicense）？
- **首期 DoD（Definition of Done）**：
  - 索引到 ≥ N 个真实 dsh-plugin 仓库（如 ≥ 30）。
  - 至少 X 条分类榜上线（X = 实际分类数）。
  - Workflow 跑通一次且成功 commit `data/` 增量。
  - GitHub Pages 部署成功（或显式选择不部署）。
  - README、CONTRIBUTING、CODE_OF_CONDUCT、MIT LICENSE 齐备。
  - 第一次自我审计：人工抽查 Top 20，确认无明显滥用/钓鱼仓库。
- **欢迎新仓库流程**：是否有 issue 模板（`new-plugin-submission.yml`）、自动 checks 反馈。

## Resolution

_resolved 时把规则 + DoD 写进主地图 Notes 作为「Quality & DoD」块。_

## Source (resolve 时填)

_starfleet / awesome-* / best-of-* 榜单的反作弊先例。_
