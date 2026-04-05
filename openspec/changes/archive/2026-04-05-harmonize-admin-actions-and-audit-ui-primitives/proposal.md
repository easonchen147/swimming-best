## Why

管理后台头部和首页快速操作区虽然已经切到统一按钮体系，但细节仍不一致：头部“查看公开页”和“退出登录”的字体与色彩语气不协调，快速操作区三个入口的内部排版也没有做到完全同构。与此同时，用户要求对当前项目全部共享 UI components 再做一轮 shadcn 审计，确认是否还有“只是长得像，但使用方式没对齐官方”的组件。

这轮需要一边把后台高频动作区彻底统一，一边把这次全局审计的结论固化到 shared UI 和 spec 里，避免后续重复踩同类问题。

## What Changes

- 统一管理后台头部“查看公开页”和“退出登录”按钮的字体、尺寸、权重和表面语气，仅保留语义色差。
- 统一后台首页“快速操作”三个入口的内部布局与左对齐规则，做到完全同构。
- 基于官方 shadcn 文档再审一次当前共享 UI primitives，修正高置信度偏差，并把“哪些是规范问题、哪些是项目定制”同步进主 specs。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `admin-dashboard-navigation`: 后台头部动作和首页快捷入口必须共享完全一致的按钮版式与排版规则。
- `uiux-modernization`: 共享 UI 审计规则需要明确到“是否符合官方 shadcn/Radix 语义”以及“项目定制是否仍在主题边界内”。

## Impact

- **Frontend pages**: `frontend/src/components/layout/admin-shell.tsx`, `frontend/src/app/admin/page.tsx`
- **Frontend shared UI / audit evidence**: `frontend/src/components/ui/*` 以及必要的测试文件
- **Specs**: `openspec/specs/admin-dashboard-navigation/spec.md`, `openspec/specs/uiux-modernization/spec.md`
