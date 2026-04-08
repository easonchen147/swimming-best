---
title: fix: Restore admin swimmer mobile layout and align calendar popovers
type: fix
status: active
date: 2026-04-09
origin: docs/brainstorms/2026-04-09-admin-swimmer-mobile-and-calendar-popovers-requirements.md
---

# fix: Restore admin swimmer mobile layout and align calendar popovers

## Overview

修复后台 `队员管理` 页移动端成员列表不可见的问题，并把后台日期组件弹层统一到当前共享的 shadcn/Radix `Calendar + Popover` 视觉语言。

## Problem Frame

`frontend/src/app/admin/swimmers/page.tsx` 当前桌面端仍然可用，但移动端虽然拿到了成员数据，却没有稳定地把成员列表渲染到可见区域。与此同时，`frontend/src/components/shared/date-picker.tsx`、`frontend/src/components/ui/calendar.tsx` 仍然存在和当前系统其它弹层组件表面不完全一致的地方，导致后台几个页面的日期弹层风格显得突兀。

## Requirements Trace

- R1. 队员管理页要恢复移动端成员列表展示。
- R2. 移动端成员列表不能超出一屏宽度。
- R3. 日期组件弹层要统一到当前 shadcn/Radix 风格。
- R4. 桌面端整体交互和视觉风格保持不变。

## Scope Boundaries

- 不重做后台页面信息结构。
- 不更改日期输入的业务值格式。
- 不扩展到后台所有控件，只聚焦当前受影响的日期弹层和队员页移动端。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/admin/swimmers/page.tsx`: 当前队员管理页，桌面表格与移动端成员展示都在这里。
- `frontend/src/app/admin/swimmers/page.test.tsx`: 当前页面行为测试。
- `frontend/src/components/shared/date-picker.tsx`: 共享日期/年份选择器。
- `frontend/src/components/ui/calendar.tsx`: 共享 Calendar primitive。
- `frontend/src/components/ui/popover.tsx`: 当前共享 Popover primitive。
- `frontend/src/app/admin/records/page.tsx`: 日期组件使用方之一。
- `frontend/src/app/admin/goals/page.tsx`: 日期组件使用方之一。

### Key Technical Decisions

- **恢复移动端卡片视图而不是继续压缩表格**
  - 这样能在不动桌面端的前提下恢复移动端可读性。

- **日期弹层统一走共享 Popover surface**
  - 使用共享 `PopoverContent` 和共享 `Calendar` 表面层级，避免页面自己拼弹层外观。

## Implementation Units

- [ ] **Unit 1: Restore admin swimmer mobile roster rendering**

**Goal:** Make the swimmer roster readable again on phone-sized viewports without changing the desktop table experience.

**Requirements:** R1, R2, R4

**Files:**
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.test.tsx`

**Approach:**
- Keep the desktop table for `xl` and above.
- Provide a dedicated mobile card list below `xl`.
- Ensure member cards stay within viewport width.

**Test scenarios:**
- Happy path: mobile-friendly member cards render when swimmer data exists.
- Edge case: the page can show the same swimmer information in both views without test ambiguity.

**Verification:**
- On narrow layouts, member data is visible and no horizontal overflow is required.

- [ ] **Unit 2: Align date picker popovers with shared calendar styling**

**Goal:** Make date picker popovers feel like the same shadcn/Radix family as the rest of the UI.

**Requirements:** R3, R4

**Files:**
- Modify: `frontend/src/components/shared/date-picker.tsx`
- Modify: `frontend/src/components/ui/calendar.tsx`
- Modify: `frontend/src/components/shared/date-picker.test.tsx`

**Approach:**
- Keep `Calendar` as the content primitive.
- Use the shared Popover wrapper and surface styling consistently.
- Ensure `DatePickerInput` and `YearPickerInput` both fit the same visual family.

**Test scenarios:**
- Happy path: date picker still updates selected date.
- Happy path: year picker still updates selected year.
- Edge case: placeholder and clear action continue working.

**Verification:**
- The popover surface matches the rest of the app’s Select/Popover/Card styling.

- [ ] **Unit 3: Verify touched admin pages**

**Goal:** Ensure all affected admin pages still pass lint, tests, and build after the UI fixes.

**Requirements:** R1, R2, R3, R4

**Files:**
- Test: `frontend/src/app/admin/swimmers/page.test.tsx`
- Test: `frontend/src/components/shared/date-picker.test.tsx`

**Verification:**
- `npm --prefix frontend run lint`
- `npm --prefix frontend test`
- `npm --prefix frontend run build`
