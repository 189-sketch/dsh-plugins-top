---
name: T03 — Stack and CI/CD Shape
type: wayfinder:grilling
status: open
blockedBy: []
---

# T03 — Stack and CI/CD Shape

## Question

构建产物层面的具体形状怎么定？

要敲定的事：

- **脚本栈**。候选：Node.js 20 零依赖、Python 3.11 + httpx、Deno 1.40+。裁定需考虑：DSH 主生态用 Node（与本仓库后续接入 dsh 工具链无摩擦），但 Python 测试生态更熟。
- **测试栈**。候选：vitest + msw / pytest + respx / Deno test + fetch mock。
- **CI**。`runs-on: ubuntu-latest`，缓存策略（pip / node_modules / 无），permissions 块（`contents: write` / `pages: write` / `id-token: write`）。
- **调度**。cron 表达式候选：`0 3 * * *`（每天 03:00 UTC）或 `0 */6 * * *`（每 6 小时）。是否再加 `workflow_dispatch` / `push` 触发？
- **Pages 部署**。是否启用？源目录是 `public/` 还是直接以 `docs/` 为根？是否需要静态模板（hbs / ets / jinja）来生成 HTML？
- **README + docs 的关系**。仓库 README 是否直接渲染总榜？还是把榜单分开到 `docs/`，README 只放导航？
- **依赖收紧**。是否锁文件（`package-lock.json` / `poetry.lock` / `deno.lock`）要进 git？
- **本地可跑性**。开发者本地能用同一脚本重跑（debug 友好）。

## Resolution

_resolved 时把决议回填成主地图 Notes 末尾的「Build shape」块。_

## Source (resolve 时填)

_选栈的代价估算、CI 装机时长对比。T03 不必等其它票的输出。_
