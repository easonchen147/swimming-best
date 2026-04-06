## Why

当前竞技场虽然已经有赛道聚合数据，但热力图对家长、教练和学员本人来说不够直接。真正有价值的是明确的排名、差距和多维筛选视角，而不是一块“看起来像市场”的热力板。

需要把竞技场从热力图主视图升级为多维排行榜系统，让用户能够按性别、池长、年龄段和队伍快速查看相同项目下的排位结果。

## What Changes

- 用排行榜视图替换竞技场热力图主视图。
- 支持按照男子、女子、男女混合视角查看榜单。
- 支持年龄段视图与不区分年龄视图切换。
- 继续严格保证排行榜只发生在同项目、同池长的边界内。
- 保留当前竞技场主色调与 shadcn/ui 风格，不引入新的视觉主题。

## Capabilities

### New Capabilities
- `arena-leaderboards`: 定义公开竞技场多维排行榜能力。

### Modified Capabilities
- `arena-market-board`: 将竞技场主视图从热力市场板升级为排行榜系统。
- `interactive-data-visualization`: 调整竞技场交互重心，从热力图点击钻取改为榜单浏览和筛选。
- `responsive-ui`: 确保竞技场榜单在移动端保持可读和可滚动。

## Impact

- **Frontend**: `frontend/src/components/arena/**`, `frontend/src/app/arena/page.tsx`, `frontend/src/app/compare/page.tsx`, `frontend/e2e/responsive-compare.spec.ts`
- **Backend**: `backend/swimming_best/repository.py`, `backend/swimming_best/services.py`, `backend/swimming_best/public_routes.py`
- **Tests**: 前端榜单测试、公开 API 测试、Playwright 竞技场验证
