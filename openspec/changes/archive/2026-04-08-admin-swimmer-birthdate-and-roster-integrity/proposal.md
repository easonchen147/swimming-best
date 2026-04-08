## Why

后台 `队员管理` 页目前仍然把出生信息限制在 `birthYear`，日期控件也没有接入项目当前的 shadcn / Radix 组件语义。与此同时，桌面端队员表格存在信息重复和列头错位问题，编辑链路里还存在“完全隐藏后无法切回公开”的严重 bug。由于这些问题都集中在同一个高频后台工作流里，需要一轮统一修正。

## What Changes

- 为队员档案增加完整生日支持，并在后端继续维护兼容 `birthYear`。
- 为历史数据库增加向后兼容迁移，保留旧年份数据，不伪造完整生日。
- 将后台队员生日控件改为 shadcn 风格的 `Popover + Calendar` 组合，placeholder 统一为“请选择”。
- 修复队员从“完全隐藏”切回公开时的前端提交流程问题。
- 收口后台队员表格：姓名列不再拼接队伍名，桌面端列结构更稳定，操作列移除“下载”按钮。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `swimmer-roster`: 队员后台档案支持完整生日，并保持旧年份兼容链路。
- `uiux-modernization`: 队员生日控件与后台花名册表格进一步收敛到统一的共享组件风格。

## Impact

- Affected frontend:
  - `frontend/src/app/admin/swimmers/page.tsx`
  - `frontend/src/components/shared/date-picker.tsx`
  - `frontend/src/components/ui/calendar.tsx`
  - `frontend/src/lib/api/admin.ts`
  - `frontend/src/lib/types.ts`
  - `frontend/src/lib/swimmer-label.ts`
- Affected backend:
  - `backend/swimming_best/db.py`
  - `backend/swimming_best/repository.py`
  - `backend/swimming_best/services.py`
- Tests:
  - `backend/tests/test_admin_api.py`
  - `backend/tests/test_db_migration.py`
  - `frontend/src/components/shared/date-picker.test.tsx`
  - `frontend/src/app/admin/swimmers/page.test.tsx`
  - `frontend/src/lib/api/admin.test.ts`
