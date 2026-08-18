---
name: T02 — Classification Taxonomy
type: wayfinder:grilling
status: open
blockedBy: [T01]
---

# T02 — Classification Taxonomy

## Question

DSH 插件的具体分类方案是什么？分类的判定来源又是什么？

要敲定的事：

- **最终类别集合**。候选：`skill` / `tool` / `skin` / `provider` / `ui-panel` / `other`——逐个确认保留、合并、还是增删。是否要拆出 `theme` 与 `skin`，或合并成 `look-and-feel`？
- **每类的判定规则**。候选来源（择一或加权）：
  - 仓库根存在 `SKILL.md` / `.dsh-plugin.yml`——强声明。
  - `package.json` 的 `dependencies` 命中 `@deepseek-ai/dsh-<x>`、`@liustack/dsh-<x>`、`@linxin666/dsh-<x>` 的某一族。
  - `topics` 命中 `dsh-skill` / `dsh-tool` / `dsh-skin` / `dsh-provider` / `dsh-client-ui` 等。
  - description 中的关键字匹配。
  - 复合规则与优先级。
- **冲突/并列**：单仓库同时满足多种信号怎么办？首要类 + 次要标签？
- **扁平还是分层**：所有类同级，还是允许 `skin.theme` / `ui-panel.task-board` 二级？
- **新类添加流程**：是否需要人工 review，新增类的版本化策略。

## Resolution

_resolved 时把规则写回主地图的 Notes 作为「Category rules」块，单一可信源；本票正文保持为问题。_

## Source (resolve 时填)

_T02 紧随 T01，源里需要引用 T01 输出的字段表，明确「哪一字段到哪一类」。_
