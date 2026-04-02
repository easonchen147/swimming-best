## Why

当前主 specs 与当天归档的 Python 迁移变更，仍然把 team/group 描述成
swimmer 档案上的自由文本字段。这和真实业务不一致：team 是由管理员
动态维护的实体，孩子必须被分配到一个受管 team，而不是直接写入
`A`、`B`、`C` 之类的字符串。

如果继续在错误模型上补实现，即使构建和测试通过，也只会把错误业务假设
固化到 schema、API、前端和公开展示中。因此需要一个新的 OpenSpec change
显式修正这件事，并诚实地覆盖之前归档文档里的错误建模描述。

## What Changes

- **BREAKING** 将 swimmer 的 `team/group` 从自由文本改为受管实体关联：
  后端引入 `teams` 表，swimmer 改为保存 `team_id`。
- 新增后台 team 管理能力，支持创建、列表、更新 team，并为 swimmer
  提供基于 team 实体的分配与变更。
- 更新后台与公开 API，把 team 作为一等对象返回，并用 `teamId` 进行筛选
  与赋值，不再以 `teamName` 自由文本作为契约。
- 重构后台管理 UI：管理员可以维护 team，并在创建/编辑 swimmer 时通过
  选择受管 team 完成分配。
- 重构公开名单、详情、对比、分享与后台列表中的 team 展示、筛选和说明，
  统一基于 managed team 实体，而不是硬编码或自由文本。
- 更新自动化测试，覆盖真实业务流：创建 team -> 分配 swimmer ->
  列表/筛选/展示正确。
- 明确说明此前 archived change 与当前主 specs 中关于
  “team/group 为自由文本”的内容存在业务模型错误，并由本 change 修正。

## Capabilities

### New Capabilities
- `managed-teams`: 管理员维护一等 team 实体，并在后台工作流中提供可选择的
  team 目录。

### Modified Capabilities
- `swimmer-roster`: swimmer 档案必须关联受管 team 实体，不再使用自由文本
  team/group 字段。
- `performance-recording`: 成绩录入与管理展示中的 swimmer 区分信息必须来自
  managed team 关联。
- `public-performance-portal`: 公开名单、详情、对比和分享场景中的 team 展示
  与筛选必须基于 managed team 实体。
- `responsive-ui`: 后台 team 管理、swimmer team 选择、以及公开 team 筛选
  在桌面端和移动端都必须保持可用。

## Impact

- `backend/` 需要新增 team 数据表、数据迁移/初始化逻辑、repository/service
  查询联表、admin/public 路由与测试。
- `frontend/` 需要更新类型、API client、管理页与公开页的数据模型，
  把 `teamName` 自由文本改为 `teamId + team` 对象。
- `openspec/specs/` 需要通过本 change 修正当前基线里对 team/group 的错误描述。
- 本 change 完成并验证后，需要归档并同步 specs，作为后续团队模型的唯一正确
  基线。
