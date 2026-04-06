## Why

公开竞技场和公开个人详情页都已经具备基础能力，但当前信息架构还不够收束。竞技场同时展示“赛道排行榜”和“赛道详情”造成重复理解成本，公开个人详情页的“保存分享海报”又只导出了顶部主卡，无法真正体现完整成长内容，因此这次需要集中修正公开展示层的结构与分享体验。

## What Changes

- 将竞技场改成详情优先的主视图，弱化当前重复的排行榜卡片区。
- 删除竞技场顶层价值较弱的“焦点赛道”指标卡，替换为更有解释力的当前赛道指标。
- 统一公开个人详情页主模块之间的纵向间距，让 Hero、指标卡、成长分析保持一致节奏。
- 修正公开个人详情页的分享导出范围，使“保存分享海报”覆盖完整成长内容而不是只截取首屏。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `arena-leaderboards`: 调整竞技场的主视图职责，把赛道详情作为核心分析面板，并更新顶层指标含义。
- `public-performance-portal`: 调整公开个人详情页的布局节奏与分享导出行为，使公开成长页导出完整成长内容。
- `responsive-ui`: 更新公开竞技场与公开个人详情页的响应式布局节奏，确保新的详情化结构和完整海报导出在移动端依然可用。

## Impact

- Affected code:
  - `frontend/src/components/arena/arena-page.tsx`
  - `frontend/src/components/arena/arena-leaderboards.tsx`
  - `frontend/src/app/swimmers/[slug]/page.tsx`
  - `frontend/src/components/shared/public-event-analytics-view.tsx`
  - `frontend/src/app/compare/page.test.tsx`
  - `frontend/e2e/responsive-compare.spec.ts`
- APIs: No backend contract change is required for the first slice; existing arena payloads are reused.
- Systems: Public arena browsing, public swimmer detail layout, and client-side image export flows are affected.
