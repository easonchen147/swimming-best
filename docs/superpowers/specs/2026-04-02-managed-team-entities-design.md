# Managed Team Entities Design

**Problem**

现有实现与主规格都把 team/group 当成 swimmer 上的自由文本字段，这与真实
业务冲突。真实模型应当是：team 由管理员动态维护，swimmer 通过受管 team
实体完成归属。

**Approved Direction**

- team 是 first-class entity
- swimmer 通过 `team_id` 关联 team
- 后台要支持 team 创建、列表、更新
- swimmer 创建/编辑必须选择 team
- 公开与后台展示、筛选、详情、对比都统一基于 managed team

**Architecture**

- 后端新增 `teams` 表，并把 `swimmers.team_name` 重构为 `swimmers.team_id`
- API 契约统一改为 `teamId` 输入、`team` 对象输出
- 前端类型与页面从 `teamName` 文本改为 `teamId + team`
- 通过测试覆盖真实业务流：创建 team -> 分配 swimmer -> 列表/筛选/展示

**Migration Notes**

- 现有 SQLite 数据若仍为旧 schema，需要在启动时迁移
- 历史 `team_name` 唯一值会生成 team 记录并回填给 swimmer
- 空 team 数据迁移为系统生成的 `未分组` team，保证 swimmer 始终关联 team

**Verification Gates**

- backend pytest 必须通过
- frontend vitest / eslint / build 必须通过
- review findings 必须修复
- OpenSpec verify / archive 必须在功能与接口对齐后执行
