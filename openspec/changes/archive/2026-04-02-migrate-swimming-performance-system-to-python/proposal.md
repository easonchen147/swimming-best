## Why

当前仓库已经基于 Go 后端完成了部分能力，但前端与后端都尚未收尾，且新的业务要求已经明确要求把后端整体切换到 Python 技术栈，并补上队员所属队伍/分组能力。现在继续在 Go 实现上收尾会直接偏离目标，因此需要以一个新的 OpenSpec 变更把迁移、补完和验收统一纳入同一轮交付。

## What Changes

- **BREAKING** 将当前 Go 后端完整替换为 Python 后端，统一使用 `Python + uv + Poetry + Flask + SQLite`。
- **BREAKING** 在 Python 替代完成后，删除仓库内全部 Go 代码、模块、构建文件、测试、配置与脚本引用。
- 为队员档案新增并贯通 `team/group` 字段，使其可在后台、录入流程、公开名单、公开详情和对比场景中用于区分同名或相近身份的队员。
- 补完旧变更未完成的后台与公开端页面、数据流、响应式适配和自动化测试，使系统达到可验证、可归档状态。
- 更新 README、运行脚本、开发指引与验证流程，使仓库只体现 Python 后端方案。

## Capabilities

### New Capabilities
- `python-backend-runtime`: 使用 Flask + SQLite 提供完整后台/公开 API，并以 Python 工具链替代旧 Go 运行时与开发流程。

### Modified Capabilities
- `swimmer-roster`: 队员档案要求增加 team/group，并在创建、编辑、列表与公开身份展示中使用该字段。
- `performance-recording`: 成绩录入与上下文录入流程需要在选人、返回结果与管理列表中体现 team/group 区分信息。
- `public-performance-portal`: 公开名单、详情、项目详情、对比与分享页需要在适当位置展示 team/group，并补齐缺失页面。
- `responsive-ui`: 已有后台与公开页的桌面端/移动端适配需要覆盖 team/group 展示、筛选和新增页面。

## Impact

- `backend/` 将从 Go 项目重建为 Python 项目，引入 Poetry、Flask、pytest，并保留 SQLite 数据存储。
- `frontend/` 需要继续对接新的 Python API，补完后台与公开页缺口，并增加 team/group 相关展示与交互。
- 根目录脚本、README、测试命令和本地运行说明将改为 Python 后端方案。
- 旧变更 `build-swimming-performance-system` 需要在本轮实现完成并验证后归档；新迁移变更也需要在同一轮验证后归档。
