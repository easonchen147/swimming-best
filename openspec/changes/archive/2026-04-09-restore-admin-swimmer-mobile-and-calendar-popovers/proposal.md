## Why

后台 `队员管理` 页在移动端已经失去可用性，而日期组件弹层又和当前 shadcn/Radix 视觉语言不一致。这两个问题都属于明显的界面回归，需要一并修复。

## What Changes

- 恢复 `队员管理` 页的移动端成员列表展示。
- 保持桌面端表格样式和整体交互不变。
- 统一后台日期组件弹层到共享 `Calendar + Popover` 风格。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `responsive-ui`: 恢复后台队员管理页在移动端的成员展示可用性。
- `uiux-modernization`: 统一后台日期组件弹层表面语言到当前共享 shadcn/Radix 风格。

## Impact

- `frontend/src/app/admin/swimmers/page.tsx`
- `frontend/src/app/admin/swimmers/page.test.tsx`
- `frontend/src/components/shared/date-picker.tsx`
- `frontend/src/components/ui/calendar.tsx`
- `frontend/src/components/shared/date-picker.test.tsx`
