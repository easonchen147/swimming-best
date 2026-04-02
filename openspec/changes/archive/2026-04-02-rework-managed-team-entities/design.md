## Context

当前 Python 后端与 Next.js 前端已经从 Go 迁移出来，但 team/group 仍沿用了
错误的业务建模：数据库使用 `swimmers.team_name`，API 暴露 `teamName`
字符串，前端通过自由文本输入和去重列表完成管理与筛选。与此同时，
`openspec/specs/swimmer-roster/spec.md` 与同日归档的迁移 change 也把
team/group 写成了 swimmer 字段上的可选字符串。

这次变更不是简单改名，而是跨 OpenSpec、数据库 schema、服务层、API 契约、
前端管理界面、公开展示与测试的系统性纠偏。约束如下：

- 保持已经引入的 Python 后端栈，不回退到 Go。
- 不能用“示例值 A/B/C”替代真实 team 实体模型。
- 不靠兼容旧错误字段掩盖业务问题；前后端接口要显式对齐到新模型。
- 归档和提交前必须完成代码评审、功能验证与接口对齐核查。

## Goals / Non-Goals

**Goals:**
- 引入 first-class `teams` 实体，由管理员动态创建、查看、更新。
- 让 swimmer 通过 `team_id` 关联受管 team，并在后台/公开工作流里返回 team
  对象而非自由文本。
- 让后台管理页支持 team 管理与 swimmer team 选择。
- 让公开名单、详情、对比、分享与后台列表/筛选都统一使用 managed team。
- 用测试覆盖真实业务路径，并在归档前核对 OpenSpec、实现与接口是否一致。

**Non-Goals:**
- 不引入多租户、层级团队树、教练权限分层或批量导入导出。
- 不新增 team 独立公开页面或复杂统计中心。
- 不为旧 `teamName` 契约保留长期双写/双读兼容层。

## Decisions

### Decision: 使用 `teams` 表 + `swimmers.team_id` 建模 team 归属

数据库新增 `teams` 表，至少包含 `id`、`name`、`sort_order`、`is_active`、
时间戳字段；`swimmers` 改为保存 `team_id` 外键。所有读取 swimmer 的地方都
联表返回 team 摘要对象。

这样可以保证：
- team 可被独立管理；
- swimmer assignment 有外键约束；
- team 改名后，后台和公开展示自动跟随最新名称；
- 过滤与展示使用稳定标识，而不是不受控字符串。

备选方案：
- 继续用 `team_name` 文本字段：和业务要求冲突，直接排除。
- 同时保留 `team_name` 与 `team_id` 双模型：会延长错误状态，不符合本次
  纠偏目标。

### Decision: API 契约改为 `teamId` 输入 + `team` 对象输出

后台创建/更新 swimmer 时使用 `teamId`，筛选参数也改为 `teamId`。swimmer、
performance、goal、public roster 等所有对外 payload 统一返回：

- `teamId`: 便于表单和筛选传递稳定标识
- `team`: `{ id, name, sortOrder, isActive }`

不再把 `teamName` 作为主契约字段暴露，避免前端继续把 team 当自由文本。

备选方案：
- 仅返回 `teamName`：无法表达实体关系，也不利于后续 team 更新。
- 只返回 `team` 不返回 `teamId`：前端表单处理和筛选状态会更绕，收益不大。

### Decision: 后台新增 team 管理页，并把 swimmer team 输入改为选择器

管理端新增 team 列表/创建/编辑入口；swimmer 表单不再手输 team 名称，
而是从已管理的 team 列表中选择。这样能保证 assignment 始终指向受管实体，
也能从交互层面阻止模型继续跑偏。

备选方案：
- 仅在 swimmer 表单里下拉选择，但不提供 team 管理页：无法动态维护实体，
  不满足业务要求。

### Decision: 对现有 SQLite 数据执行就地迁移，而不是假设空库重建

`init_db` 在启动时检查 schema：
- 若不存在 `teams` 表，则创建；
- 若 `swimmers` 仍是旧 `team_name` 结构，则重建 swimmers 表为新结构；
- 从旧 `team_name` 唯一值生成 team 记录，并把 swimmer 回填到对应 `team_id`；
- 保留已有业务数据、slug、成绩、目标与外键引用。

备选方案：
- 只支持空库初始化：会让现有本地数据和开发验证环境失效。

### Decision: 公开页与后台页的 team 展示统一读取 team 对象，不硬编码文案假设

公开名单、详情、分享、对比，以及后台名单和 dashboard，都通过
`swimmer.team.name` 渲染 team 信息；筛选逻辑使用 `teamId`。页面文案仅把
`A/B/C` 作为示例，不在代码中写死任何固定组别。

备选方案：
- 保留现有前端 `listTeams(swimmers)` 基于字符串去重：虽然能工作，但仍然把
  team 当展示文本而不是实体，不符合纠偏目标。

## Risks / Trade-offs

- `[SQLite 迁移重建 swimmers 表时破坏已有数据]`
  → 先以事务执行迁移，迁移前检查旧列，迁移后回填 team 映射并保留原主键。
- `[前后端接口改为 teamId/team 后会引发较多类型改动]`
  → 统一从共享 types 和 API client 开始改，逐页收敛编译错误。
- `[公开页或测试仍遗留 A/B/C 假设]`
  → 全文搜索 `teamName`、`A`、`B`、`C` 相关用例并改成动态 team 创建流。
- `[归档时主 specs 与 archived docs 之间的历史叙述看起来冲突]`
  → 在 proposal/design 中明确注明：此前 archived docs 的 team 文本模型
  是业务上错误的，本 change 是显式修正，不假装兼容。

## Migration Plan

1. 创建新的 OpenSpec change，明确 managed team 实体模型与受影响 capability。
2. 先写失败测试，覆盖 team CRUD、swimmer team assignment、admin/public 过滤
   与展示。
3. 重构 SQLite schema 与迁移逻辑，引入 `teams` 表和 `swimmers.team_id`。
4. 更新 repository/service/routes，使 admin/public API 输出统一的 team 模型。
5. 重构前端类型、API client、admin team 管理页、swimmer 表单与公开展示页。
6. 跑后端/前端完整验证，做最终 code review，修复问题后归档并提交。

## Open Questions

- 本次不保留未分配 team 的 swimmer。若旧库里存在空 `team_name`，迁移时将创建
  一个系统生成的 `未分组` team 并回填，以满足“每个 swimmer 都属于一个
  managed team”这一业务要求。
