---
title: feat: Polish admin roster density and shared date pickers
type: feat
status: active
date: 2026-04-08
origin: docs/brainstorms/2026-04-08-admin-roster-and-picker-polish-requirements.md
---

# feat: Polish admin roster density and shared date pickers

## Overview

这次改动集中修正后台高频页面里的几个显示层问题：收紧队员管理表格列宽与状态文案、让队伍管理卡片显示更有价值的队员数指标，并把共享日期弹层的结构压回官方 shadcn date picker 推荐组合。

## Problem Frame

当前 `frontend/src/app/admin/swimmers/page.tsx` 的桌面端表格用了偏宽的姓名列，导致整体容易出现横向滚动；模式标签还直接把 `nickname` / `real_name` / `hidden` 这些内部状态暴露给界面。`frontend/src/app/admin/teams/page.tsx` 的列表卡片则把排序号 `Order` 放在显著位置，而没有展示管理员更关心的队员数。与此同时，共享 `frontend/src/components/shared/date-picker.tsx` 和 `frontend/src/components/ui/calendar.tsx` 叠加了过厚的自定义外层，导致在队员、成绩、目标等页面里弹出的时间组件像多层组件重叠，不符合用户给出的官方 demo 预期。

## Requirements Trace

- R1. 队员管理表格在桌面端应避免不必要的横向滚动。
- R2. 公开状态模式标签要使用中文语义，不显示原始英文枚举。
- R3. 队伍管理卡片优先显示队员数，状态文案使用中文“有效”。
- R4. 共享日期弹层结构应更接近官方 shadcn date picker 组合，避免重叠感。

## Scope Boundaries

- 不调整队伍排序逻辑和表单字段，只调整列表信息展示。
- 不改动时间字段的数据格式和后端接口。
- 不为日期组件新增复杂快捷选择逻辑，只修正结构和样式层次。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/admin/swimmers/page.tsx`
  队员表格列宽、状态文案、操作区都在这里。
- `frontend/src/app/admin/teams/page.tsx`
  队伍卡片当前展示 `Order` 和英文状态文案。
- `frontend/src/components/shared/date-picker.tsx`
  当前日期选择器外层包裹过厚，是多个页面的共享来源。
- `frontend/src/components/ui/calendar.tsx`
  当前 shared calendar primitive，决定 Calendar 内部结构和层次。
- `frontend/src/app/admin/records/page.tsx`
  使用共享日期组件的成绩管理页。
- `frontend/src/app/admin/goals/page.tsx`
  使用共享日期组件的目标管理页。
- `frontend/src/components/admin/quick-record-modal.tsx`
  也复用了共享日期组件。
- `backend/swimming_best/repository.py`
  队伍目录当前未返回队员数，若前端要显示该指标，需要从这里补字段。
- `backend/tests/test_admin_api.py`
  适合补队伍列表字段的后端回归断言。

### External Guidance

- 用户明确指定参考官方 shadcn date picker 文档：`https://ui.shadcn.com/docs/components/radix/date-picker`
- 官方推荐结构强调更轻的 `PopoverContent` 容器和单层日历面板，不需要额外的厚标题卡片包装。

## Key Technical Decisions

- **队员表格改为更紧凑的固定列宽**
  - 缩窄第一列，减少横向占用；
  - 状态列和操作列采用更紧凑宽度；
  - 继续保留桌面端表格结构，但优先避免无意义滚动。

- **模式标签改成中文 UI 映射**
  - `nickname -> 昵称`
  - `real_name -> 真名`
  - `hidden -> 不显示额外模式标签`

- **队伍目录增加 `swimmerCount`**
  - 后端 `list_teams()` 直接聚合队员数量；
  - 前端队伍卡片用这个值替换 `Order` 展示；
  - `sortOrder` 仍保留在编辑表单与返回 payload 中。

- **共享日期弹层改成单层轻容器**
  - `DatePickerInput` 的 `PopoverContent` 去掉额外标题层和厚 padding；
  - `Calendar` 结构压回更接近官方实现的 class 组合；
  - “今天 / 清空”按钮保留，但放在轻量 footer 中，不再制造第二层卡片感。

## Implementation Units

- [ ] **Unit 1: Tighten swimmer roster table density and labels**

**Goal:** Remove horizontal overflow pressure and make roster labels read naturally in Chinese.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.test.tsx`

**Approach:**
- Reduce the width allocation of the name column and rebalance the colgroup.
- Keep the identity block readable but more compact.
- Replace raw mode-label text with Chinese labels and suppress the hidden-mode extra label.

**Test scenarios:**
- Happy path: visible mode labels render as `昵称` or `真名`.
- Happy path: hidden swimmers do not render the extra `HIDDEN` badge text.
- UI regression: the roster row still shows the real-name secondary line.

- [ ] **Unit 2: Add swimmer counts to managed team cards**

**Goal:** Make the team directory cards show a more useful operational metric.

**Requirements:** R3

**Dependencies:** None

**Files:**
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/tests/test_admin_api.py`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/app/admin/teams/page.tsx`
- Modify: `frontend/src/app/admin/teams/page.test.tsx`

**Approach:**
- Extend team list queries to include aggregated swimmer counts.
- Return the new field through the admin API as part of `TeamSummary`.
- Replace `Order` display in the team cards with `队员数` and rename `Active` to `有效`.

**Test scenarios:**
- Happy path: `/api/admin/teams` returns `swimmerCount`.
- Happy path: team cards render `队员数`.
- UI regression: active teams render the status text `有效`.

- [ ] **Unit 3: Simplify the shared date picker surface**

**Goal:** Make every admin page using the shared date picker feel like one clean popover instead of stacked components.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `frontend/src/components/shared/date-picker.tsx`
- Modify: `frontend/src/components/ui/calendar.tsx`
- Modify: `frontend/src/components/shared/date-picker.test.tsx`

**Approach:**
- Align `PopoverContent` sizing and padding with the official shadcn date picker structure.
- Remove the extra visual title strip and reduce wrapper chrome.
- Tune calendar classNames so dropdowns, nav buttons, and day cells read as one panel instead of nested surfaces.

**Test scenarios:**
- Happy path: picker still opens and selecting `今天` updates the value.
- Happy path: placeholder behavior remains unchanged.
- UI regression: clear button still clears the value.

- [ ] **Unit 4: Verification and closeout**

**Goal:** Validate the polish pass across affected admin pages and finish the workflow cleanly.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Units 1-3

**Files:**
- Modify: `openspec/changes/admin-roster-and-picker-polish/tasks.md`

**Approach:**
- Run targeted frontend/backend tests, then full frontend lint/test/build and backend lint/test.
- Manually verify the change against plan and spec delta because `opsx:verify` is unavailable.
- Archive the change and commit the work.
