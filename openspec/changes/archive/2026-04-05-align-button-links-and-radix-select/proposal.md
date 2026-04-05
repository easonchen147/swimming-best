## Why

当前前端还有两类共享组件问题没有收口。第一类是按钮化链接：管理后台头部“查看公开页”、后台首页“快速操作”的链接按钮、公开页顶部导航都看起来像在用共享 `Button`，但由于 `asChild` 语义没有正确落到 `Link` 根节点，视觉和交互表达并不完全对齐。第二类是下拉框：项目已经安装了 `@radix-ui/react-select`，但共享 `Select` 仍然是原生 `<select>` 的自定义包装，不是 shadcn 官方文档那套 SelectTrigger / SelectContent / SelectItem 体系。

这轮需要把这两个共享层问题一次修正，避免每个页面继续各自补丁式修 UI。

## What Changes

- 修正共享 `Button` 的 `asChild` 语义，让链接类按钮真正以 `Link` 根节点承载按钮样式。
- 统一管理后台头部按钮、后台首页“快速操作”三个入口，以及公开页顶部导航三按钮的按钮风格和可点击表达。
- 将共享 `Select` 切换为基于 `@radix-ui/react-select` 的 shadcn 风格实现，并更新现有页面用法。
- 覆盖后台和公开页中当前直接依赖共享 `Select` / `SelectField` 的关键页面，确保 PC 和移动端样式一致。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `admin-dashboard-navigation`: 后台头部动作与首页快速操作按钮必须使用真正的按钮化链接表达，而不是伪按钮文本。
- `public-performance-portal`: 公开页顶部首页/对比/管理后台入口必须表现为与后台一致的按钮族。
- `uiux-modernization`: 共享选择器必须对齐 shadcn 官方 Select 组件形态，避免继续使用浏览器原生 select 包装样式。

## Impact

- **Frontend shared UI**: `frontend/src/components/ui/button.tsx`, `frontend/src/components/ui/select.tsx`, `frontend/src/components/shared/form-field.tsx`
- **Frontend pages**: `frontend/src/components/layout/admin-shell.tsx`, `frontend/src/app/admin/page.tsx`, `frontend/src/components/layout/public-shell.tsx`, `frontend/src/app/compare/page.tsx`，以及使用共享 Select 的管理页面
- **Tests**: 需要更新单测和 E2E，覆盖按钮化链接与新的 Select 交互
