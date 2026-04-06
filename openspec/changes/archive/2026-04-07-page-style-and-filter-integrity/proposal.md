## Why

当前系统最明显的问题已经不是缺少页面，而是页面之间的节奏、控件语义和筛选链路没有完全统一。公开个人成绩详情页还没有明确成为“整页成长长图”导出，多个列表页的搜索/筛选也没有完整打通到接口层，因此需要一轮集中修正来消除这些一致性问题。

## What Changes

- 统一公开个人成绩详情页各主区块的上下间距，并把分享导出升级为整页成长长图。
- 把公开首页、管理后台队伍/队员/项目页面的搜索与筛选能力补成真正的前后端参数闭环。
- 新增共享 Radix checkbox primitive，并把残留的原生 checkbox 与手写 Select 组合收敛到统一的 shadcn/Radix 语义。
- 对关键页面做一次样式与主题皮肤收口，确保主色调、控件语义和共享组件风格保持一致。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-performance-portal`: 强化公开列表筛选和公开个人成长页整页导出行为。
- `responsive-ui`: 统一公开成长页主区块节奏，并保证长图导出相关布局在移动端仍稳定。
- `uiux-modernization`: 进一步收口共享控件语义，减少原生控件和不完整 Radix 组合。
- `managed-teams`: 队伍列表搜索从页面本地过滤升级为接口可识别的查询能力。
- `swimmer-roster`: 队员列表的搜索与队伍筛选升级为前后端一致链路。
- `structured-events`: 项目列表搜索升级为接口可识别的查询能力。

## Impact

- Affected frontend:
  - `frontend/src/app/page.tsx`
  - `frontend/src/app/swimmers/[slug]/page.tsx`
  - `frontend/src/app/admin/teams/page.tsx`
  - `frontend/src/app/admin/swimmers/page.tsx`
  - `frontend/src/app/admin/events/page.tsx`
  - `frontend/src/components/shared/public-event-analytics-view.tsx`
  - `frontend/src/components/shared/form-field.tsx`
  - `frontend/src/components/ui/checkbox.tsx`
- Affected backend:
  - `backend/swimming_best/repository.py`
  - `backend/swimming_best/services.py`
  - `backend/swimming_best/admin_routes.py`
  - `backend/swimming_best/public_routes.py`
- Tests:
  - frontend API/page tests
  - backend admin/public API tests
