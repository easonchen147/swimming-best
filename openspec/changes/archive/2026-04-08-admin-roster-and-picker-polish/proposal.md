## Why

后台高频页面还存在一批明显影响使用感的收尾问题：队员表格桌面端出现不必要的横向滚动、公开状态模式文案直接显示英文枚举、队伍卡片展示了低价值的 `Order` 文案，而共享日期弹层又因为层级过厚看起来像多个组件重叠。这些都不影响功能可用性，但会持续拉低管理员的日常使用体验。

## What Changes

- 收紧后台队员表格的列宽分配，避免桌面端出现多余的横向滚动。
- 将队员公开状态模式标签改为中文展示，并在隐藏状态下不再显示额外英文标签。
- 为后台队伍目录返回并展示队员数，用它替代 `Order` 展示；同时把状态文案改成“有效”。
- 把共享日期弹层结构压回更接近官方 shadcn date picker 的单层轻量布局，修复多页面共用的重叠感。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `swimmer-roster`: 后台队员花名册在桌面端的列表密度和状态标签表达更合理。
- `managed-teams`: 后台队伍目录显示每个队伍的当前队员数。
- `uiux-modernization`: 共享日期选择弹层进一步收口到官方推荐的单层组合。

## Impact

- Affected frontend:
  - `frontend/src/app/admin/swimmers/page.tsx`
  - `frontend/src/app/admin/teams/page.tsx`
  - `frontend/src/components/shared/date-picker.tsx`
  - `frontend/src/components/ui/calendar.tsx`
- Affected backend:
  - `backend/swimming_best/repository.py`
- Tests:
  - `frontend/src/app/admin/swimmers/page.test.tsx`
  - `frontend/src/app/admin/teams/page.test.tsx`
  - `frontend/src/components/shared/date-picker.test.tsx`
  - `backend/tests/test_admin_api.py`
