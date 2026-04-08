---
title: feat: Admin swimmer birthdate and roster integrity
type: feat
status: active
date: 2026-04-08
origin: docs/brainstorms/2026-04-08-admin-swimmer-birthdate-and-roster-integrity-requirements.md
---

# feat: Admin swimmer birthdate and roster integrity

## Overview

这次改动聚焦后台 `队员管理` 页的高频核心工作流：把出生信息从“仅年份”升级到“完整生日 + 兼容年份”，把日期控件升级到与全局风格一致的 shadcn Calendar，修复队员公开状态不可逆 bug，并收口桌面端表格的信息结构与操作区。

## Problem Frame

当前 `frontend/src/app/admin/swimmers/page.tsx` 和 `backend/swimming_best/repository.py` 只围绕 `birthYear` 工作，数据库 `backend/swimming_best/db.py` 的 `swimmers` 表也只有 `birth_year`。这已经不满足后台真实使用需求。与此同时，队员表单的生日控件仍是自定义 Popover + 原生 `input[type=date]` 组合，和项目当前的 shadcn / Radix 语义层不一致。队员表格在桌面端还存在列头错位、姓名列重复拼队伍名，以及操作列保留低价值按钮的问题。更严重的是，当前编辑链路在 `publicNameMode = hidden` 时会把 `isPublic` 一起压成 `false`，但前端没有确保管理员后续切回公开态时把对应状态完整送回后端，导致档案容易卡死在隐藏态。

## Requirements Trace

- R1. 后台队员档案支持完整生日读写，前后端一致。
- R2. 旧数据库升级后继续兼容历史 `birthYear` 数据，不伪造完整生日。
- R3. 出生日期控件使用 shadcn Calendar 结构，placeholder 仅显示“请选择”。
- R4. 队员表格在 PC 端对齐稳定，姓名列去掉队伍名重复展示。
- R5. “完全隐藏”后的队员必须能稳定切回公开状态。
- R6. 队员表格操作列移除“下载”按钮，保留高价值动作。

## Scope Boundaries

- 不改公开页面的数据暴露范围，完整生日仅用于后台链路。
- 不在本轮引入新的年龄桶规则；现有年龄相关逻辑继续依赖兼容年份。
- 不批量推断历史数据的月日。
- 不重做整个队员管理页的视觉主题。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/admin/swimmers/page.tsx`
  当前队员管理页，包含表单、列表、编辑状态和操作按钮。
- `frontend/src/components/shared/date-picker.tsx`
  当前日期 / 年份组件，仍基于自定义 Popover 和原生输入。
- `frontend/src/components/ui/button.tsx`
  现有共享按钮样式基线，可用于 Calendar 导航按钮。
- `frontend/src/components/ui/table.tsx`
  现有表格 primitive，决定表头 / 单元格默认 padding 与结构。
- `frontend/src/lib/api/admin.ts`
  队员创建 / 更新 API client 入口。
- `frontend/src/lib/types.ts`
  Admin swimmer 类型定义。
- `frontend/src/lib/swimmer-label.ts`
  当前 `describeSwimmer()` 会把队伍名拼进主文案。
- `backend/swimming_best/db.py`
  SQLite schema 初始化与迁移入口。
- `backend/swimming_best/repository.py`
  队员字段解析、持久化、列表返回与公开筛选落点。
- `backend/swimming_best/services.py`
  后台 / 公开服务层；公开姓名逻辑集中在 `public_display_name()`。
- `backend/tests/test_admin_api.py`
  后台队员 API 真实回归测试。
- `backend/tests/test_db_migration.py`
  数据库升级兼容测试。
- `frontend/src/app/admin/swimmers/page.test.tsx`
  队员页交互测试。
- `frontend/src/components/shared/date-picker.test.tsx`
  日期组件交互测试。

### Existing Constraints

- 当前项目没有共享 `Calendar` primitive，也没有现成 `react-day-picker` 依赖。
- `swimmers` 公开链路会经过 `list_public_swimmers()` / `get_public_swimmer_by_slug()`，因此完整生日不能无意暴露到公开 API。
- 年龄桶和部分导出仍依赖 `birthYear`，所以它不能直接废掉。

### External Guidance

- 参考官方 shadcn 文档：`Calendar` 采用 `Popover + Calendar` 组合，而不是浏览器默认日期输入。
- 日期选择场景可以用 `captionLayout="dropdown"` 提供月 / 年切换，这比当前原生日期输入更符合统一组件语义。

## Key Technical Decisions

- **新增 `birth_date` 可选列，保留 `birth_year` 兼容列**
  - SQLite `swimmers` 表新增 `birth_date TEXT NOT NULL DEFAULT ''`。
  - 旧库升级时只补列，不改写旧 `birth_year`。

- **完整生日仅在后台链路暴露**
  - Admin list / create / update / get swimmer 数据返回 `birthDate`。
  - Public service 和 public payload 继续只使用 `birthYear`，避免额外隐私暴露。

- **后端统一解析生日字段，确保兼容语义单点收口**
  - 新 UI 提交 `birthDate` 时，后端验证 ISO 日期并自动同步 `birthYear`。
  - 旧客户端仍可只提交 `birthYear`。
  - 不伪造旧日期；如果历史记录没有 `birthDate`，则保持为空。

- **显式修复 `hidden -> public` 可逆性**
  - 前端在展示姓名模式从 `hidden` 切回 `nickname` / `real_name` 时，不再让旧隐藏状态悄悄残留。
  - 后端继续维持“`hidden` 时强制 `isPublic = false`”的安全规则，但不会阻止后续合法切回公开。

- **生日控件改为共享 shadcn Calendar 风格**
  - 新建 `frontend/src/components/ui/calendar.tsx`。
  - `DatePickerInput` 改为 `Popover + Calendar` 结构。
  - placeholder 收敛成“请选择”。

- **表格按固定列职责重排**
  - 姓名列只显示昵称 / 真名结构，不再拼队伍名。
  - 队伍列独立承担队伍展示。
  - 操作列只保留编辑和摘要导出。
  - 桌面端用明确列宽 / 内容结构减少错位。

## Open Questions

### Resolved During Planning

- 是否自动把旧 `birthYear` 推断成完整生日？不做。
- 是否让公开 API 返回完整生日？不返回。
- 是否继续沿用原生 `type="date"`？不继续，直接切到 shadcn Calendar 结构。

### Deferred to Implementation

- `react-day-picker` 是否需要新增依赖，以实际锁文件状态为准；如果缺失，则补依赖并同步锁文件。
- 桌面端表格最终列宽值可在实现时根据当前内容做最小必要调整，但不改变字段结构。

## Implementation Units

- [ ] **Unit 1: Add backward-compatible swimmer birth date storage**

**Goal:** Support exact birth dates in the backend while preserving legacy year-only data.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Modify: `backend/swimming_best/db.py`
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Modify: `backend/tests/test_admin_api.py`
- Modify: `backend/tests/test_db_migration.py`

**Approach:**
- Add `birth_date` to the schema and a startup migration for existing databases.
- Centralize birth field normalization in repository-level logic.
- Return `birthDate` in admin swimmer payloads only.
- Keep `birthYear` derived from `birthDate` when exact date is present.

**Patterns to follow:**
- Existing startup migration style in `backend/swimming_best/db.py`
- Existing repository field normalization in `create_swimmer()` / `update_swimmer()`

**Test scenarios:**
- Happy path: admin create swimmer with `birthDate` persists exact date and derived `birthYear`.
- Happy path: admin update swimmer with `birthDate` returns both fields.
- Backward compatibility: legacy DB without `birth_date` upgrades successfully and retains `birthYear`.
- Backward compatibility: old payload with `birthYear` only still succeeds.

**Verification:**
- Admin API can round-trip exact birth dates without breaking year-based consumers.

- [ ] **Unit 2: Replace the swimmer birth input with a shadcn-style calendar picker**

**Goal:** Align the swimmer birth-date interaction with the shared component language.

**Requirements:** R1, R3

**Dependencies:** Unit 1

**Files:**
- Create: `frontend/src/components/ui/calendar.tsx`
- Modify: `frontend/src/components/shared/date-picker.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/components/shared/date-picker.test.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.test.tsx`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`

**Approach:**
- Introduce a shared calendar primitive built on the official shadcn structure.
- Refactor `DatePickerInput` to use `Popover + Calendar`.
- Switch swimmer form from `birthYear` input to `birthDate` input.
- Keep placeholder as exactly “请选择”.
- Remove obsolete explanatory copy about syncing the compatibility year.

**Patterns to follow:**
- Shared trigger styling already used by the current picker controls
- Existing button theme in `frontend/src/components/ui/button.tsx`

**Test scenarios:**
- Happy path: picking a date calls `onChange` with ISO `yyyy-MM-dd`.
- Happy path: swimmer form submits `birthDate` instead of `birthYear`.
- Edge case: clearing the date submits no exact date.
- UI contract: trigger placeholder only shows “请选择”.

**Verification:**
- The birth-date control visually matches the shared component family and behaves consistently in tests.

- [ ] **Unit 3: Repair swimmer visibility editing and simplify roster actions**

**Goal:** Fix the hidden/public round-trip bug and clean up the roster row actions.

**Requirements:** R4, R5, R6

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.test.tsx`
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/lib/api/admin.test.ts`
- Modify: `frontend/src/lib/types.ts`

**Approach:**
- Ensure edit form state is initialized from both `publicNameMode` and `isPublic`.
- When the display mode moves away from `hidden`, preserve or restore the intended public toggle rather than leaving the form in a silently hidden state.
- Remove the raw download action from the roster table.
- Keep summary export action intact.

**Patterns to follow:**
- Existing toast-based submit flow in `frontend/src/app/admin/swimmers/page.tsx`
- Existing admin API helper patterns in `frontend/src/lib/api/admin.ts`

**Test scenarios:**
- Happy path: editing a hidden swimmer back to `nickname` + checked public submits the correct payload.
- Edge case: choosing `hidden` still forces a hidden payload.
- UI regression: download action is absent from the roster action group.

**Verification:**
- A swimmer can move from hidden back to public through the admin UI without manual API intervention.

- [ ] **Unit 4: Align the desktop swimmer table structure**

**Goal:** Make the swimmer roster easier to scan on desktop and remove redundant information.

**Requirements:** R4, R6

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/lib/swimmer-label.ts`
- Modify: `frontend/src/app/admin/swimmers/page.test.tsx`

**Approach:**
- Stop using `describeSwimmer()` in the roster name column.
- Render nickname / real name as a stable two-line identity block.
- Give key columns explicit width / alignment hints on desktop.
- Keep team badges in their own column.

**Patterns to follow:**
- Existing shared `Table` primitive in `frontend/src/components/ui/table.tsx`
- Existing badge usage for team/status chips

**Test scenarios:**
- Happy path: roster row shows nickname and real name separately, without team-name concatenation.
- UI regression: team badge still renders in the team column.
- UI regression: action column still keeps edit and summary export.

**Verification:**
- Desktop roster reads as aligned columns instead of mixed identity / team text blocks.

- [ ] **Unit 5: Verification, OpenSpec sync, and closeout**

**Goal:** Verify the change against its specs and finish the workflow cleanly.

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** Units 1-4

**Files:**
- Modify: `openspec/changes/admin-swimmer-birthdate-and-roster-integrity/tasks.md`
- Test: `backend/tests/test_admin_api.py`
- Test: `backend/tests/test_db_migration.py`
- Test: `frontend/src/components/shared/date-picker.test.tsx`
- Test: `frontend/src/app/admin/swimmers/page.test.tsx`
- Test: `frontend/src/lib/api/admin.test.ts`

**Approach:**
- Run targeted frontend/backend tests first, then run lint/build if the targeted tests pass.
- Perform manual spec-to-code consistency check because `opsx:verify` is unavailable in this environment.
- Archive the change and record a reusable solution note.

**Test scenarios:**
- Happy path: backend tests cover birth-date persistence and legacy migration.
- Happy path: frontend tests cover birth-date submission and hidden/public round-trip.
- Integration: frontend lint, frontend tests, frontend build, backend lint, backend tests all pass.

**Verification:**
- The implementation, plan, and spec delta all describe the same behavior with no orphaned decisions.

## System-Wide Impact

- **Schema compatibility:** `swimmers` gains one new optional column without invalidating existing year-based logic.
- **API compatibility:** admin payloads become a superset by adding `birthDate`; legacy `birthYear` requests remain accepted.
- **Privacy boundary:** full birth date is intentionally scoped to admin workflows only.
- **UI consistency:** the swimmer page converges further onto the existing shadcn / Radix component family.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 旧客户端继续只传 `birthYear` 导致新旧字段不一致 | 后端把生日字段归一化逻辑集中在 repository，并定义明确优先级 |
| 新增日期依赖导致前端锁文件漂移 | 只补最小必要依赖，并同步锁文件 |
| 公开链路意外暴露完整生日 | 只在 admin repository payload 中返回 `birthDate`，public payload 不透出 |
| `hidden` 状态修复引入新 UI 状态分叉 | 增加页面级测试覆盖编辑回填和重新提交场景 |

## Documentation / Operational Notes

- 由于 `opsx:*` 命令当前不可用，本次 verify / archive 将手工完成，但仍保持同等产物结构。
- OpenSpec 需要至少同步 `swimmer-roster` 与 `uiux-modernization`，分别覆盖数据/流程和 UI/表格表现。

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-08-admin-swimmer-birthdate-and-roster-integrity-requirements.md`
- Official reference: `https://ui.shadcn.com/docs/components/calendar`
- Related code: `frontend/src/app/admin/swimmers/page.tsx`
- Related code: `frontend/src/components/shared/date-picker.tsx`
- Related code: `backend/swimming_best/db.py`
- Related code: `backend/swimming_best/repository.py`
