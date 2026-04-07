## Why

公开个人档案页的“保存分享海报”在实际使用里已经导出空白图，不能继续作为有效功能保留；竞技场页的“赛道切换”独立卡片也让页面注意力分散。因此这次要同时修掉无效导出，并把竞技场进一步收束成详情优先的主视图。

## What Changes

- **BREAKING** 删除公开个人档案页当前“保存分享海报”的旧语义，替换为整页长图导出能力。
- 为公开个人档案页新增稳定的整页成长长图导出路径。
- 删除竞技场页独立的“赛道切换”卡片，把切换能力并入赛道详情主视图。
- 为竞技场排行榜前三增加主题内的层级强化与轻量动效。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-performance-portal`: 调整公开个人档案页的导出行为，从海报式局部保存改为整页成长长图导出。
- `arena-leaderboards`: 收掉独立赛道切换卡片，把分组切换能力整合进赛道详情，并强化前三名展示层级。
- `responsive-ui`: 确保新的整页长图导出构图和聚焦后的竞技场详情布局在桌面和移动端保持稳定。

## Impact

- Affected code:
  - `frontend/src/app/swimmers/[slug]/page.tsx`
  - `frontend/src/app/swimmers/[slug]/page.test.tsx`
  - `frontend/src/components/shared/public-event-analytics-view.tsx`
  - `frontend/src/components/arena/arena-page.tsx`
  - `frontend/src/components/arena/arena-leaderboards.tsx`
  - `frontend/src/app/compare/page.test.tsx`
- APIs: No backend contract change required.
- Systems: Public profile export flow and public arena presentation are affected.
