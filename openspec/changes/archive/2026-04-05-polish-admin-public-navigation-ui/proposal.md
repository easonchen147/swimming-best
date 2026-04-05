## Why

管理后台和公开页虽然已经完成一轮基础 UI 升级，但关键动作区仍然存在明显不一致：后台头部“查看公开页”和“退出登录”的表达方式不统一，侧边栏只有部分入口有图标，首页“快速操作”区域可读性不足，公开页顶部导航仍然像文案链接而不是动作按钮。对比页还会默认选中孩子并提前进入结果加载态，破坏了显式操作的预期。

这轮改动需要把这些高频入口统一到同一套共享组件表达上，并修正对比页的选择流程，让桌面和移动端都能更稳定地理解“现在可以做什么”和“下一步该点哪里”。

## What Changes

- 将管理后台头部的“查看公开页”与“退出登录”统一为并列按钮，并补全退出登录的真实交互。
- 补齐后台侧边栏所有导航项的图标，并确保选中项的图标与文字在高亮背景上保持白色对比。
- 重做后台首页“快速操作”面板的背景和按钮可读性，使其与页面主体卡片语义一致。
- 将公开页顶部的“首页 / 对比 / 管理后台”全部改为按钮形式，并为三个入口提供明确区分的按钮样式。
- 调整对比页为显式选择流：不再默认选中第一个孩子，不在未满足条件时显示结果加载中，并为未选孩子/未选项目状态提供明确提示。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `admin-dashboard-navigation`: 调整后台头部动作、侧边栏导航图标与选中态，以及首页快速操作区域的表达方式。
- `public-performance-portal`: 调整公开页顶部导航按钮样式，并修改对比页的默认选择与空状态行为。
- `responsive-ui`: 确保上述动作区与空状态在手机端仍保持可点击、可读和稳定布局。

## Impact

- **Frontend**: `frontend/src/components/layout/admin-shell.tsx`, `frontend/src/components/layout/public-shell.tsx`, `frontend/src/app/admin/page.tsx`, `frontend/src/app/compare/page.tsx` 以及相关测试文件。
- **Shared UI**: 继续复用现有 `Button` / `Card` / `Select` 组件，不新增新的设计体系。
- **API / Backend**: 无接口变更，无数据库变更。
