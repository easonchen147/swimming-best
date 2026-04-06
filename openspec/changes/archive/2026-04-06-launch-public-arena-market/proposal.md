## Why

现有公开“对比页”本质上还是一个手动工具页，用户必须先挑学员、再挑项目，最后才会看到图表。这种流程无法承担“快速发现哪些赛道最卷、哪些学员最强”的公开浏览需求，也承载不了你要的股票市场式热力总览。

现在需要把这个入口升级为“竞技场”，让访客先看全站公开赛道竞争格局，再进入单个赛道的详细榜单，并且始终在同项目、同池长、同性别的边界内比较。

## What Changes

- **BREAKING**：公开用户可见的“对比”产品语义升级为“竞技场”，主入口页面不再以“两人对比折线图”为主模型。
- 新增公开竞技场聚合接口，返回按赛道聚合的公开竞争数据。
- 新增竞技场主页面，使用热力图/市场板展示各赛道的头部学员与竞争热度。
- 为每个赛道提供详细榜单面板，展示同赛道 Top 学员、头名差距和竞争摘要。
- 保留 `/compare` 作为兼容入口，并将其平滑导向新的竞技场页面。

## Capabilities

### New Capabilities
- `arena-market-board`: 定义公开竞技场市场板及赛道聚合数据能力。

### Modified Capabilities
- `public-performance-portal`: 将公开“对比”入口升级为“竞技场”语义，并接入新的公开竞技场页面与兼容路由。
- `interactive-data-visualization`: 增加热力市场板与赛道详情面板的可视化交互能力。
- `responsive-ui`: 确保竞技场在桌面和移动端都能稳定浏览，不出现热力图溢出或详情面板失控。

## Impact

- **Frontend**: `frontend/src/app/arena/page.tsx`, `frontend/src/app/compare/page.tsx`, `frontend/src/components/layout/public-shell.tsx`, `frontend/src/components/arena/**`, `frontend/src/lib/api/public.ts`, `frontend/src/lib/types.ts`
- **Backend**: `backend/swimming_best/public_routes.py`, `backend/swimming_best/services.py`, `backend/swimming_best/repository.py`
- **Tests**: 前端页面测试、公开 API 测试、Playwright 公开页验证
