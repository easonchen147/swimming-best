---
title: feat: Align page styling and filter integrity
type: feat
status: active
date: 2026-04-07
origin: docs/brainstorms/2026-04-07-page-style-and-filter-integrity-requirements.md
---

# feat: Align page styling and filter integrity

## Overview

这次改动把公开成长页的“整页长图导出”和主区块节奏统一起来，同时把主要列表页的搜索/筛选从“前端本地过滤为主”升级为“前后端参数闭环”，并进一步消除共享控件层中的原生 checkbox 和不完整的 Radix Select 组合写法。

## Problem Frame

当前 `frontend/src/app/swimmers/[slug]/page.tsx` 已经有完整的成长页内容，但导出参数仍然更像“模块截图”，而不是明确的整页长图；`frontend/src/components/shared/public-event-analytics-view.tsx` 与详情页外层的 spacing 也没有完全统一。与此同时，公开首页与后台多个列表页的搜索框/筛选条件主要依赖前端本地过滤，`backend/swimming_best/admin_routes.py` 与 `backend/swimming_best/public_routes.py` 并没有统一支持这些查询参数，导致前后端链路语义不完全一致。

## Requirements Trace

- R1. 公开个人成绩详情页的主区块垂直节奏要统一。
- R2. “保存分享海报”要以整页成长长图为语义。
- R3. 共享控件应继续统一到 Radix/shadcn 语义与当前主题皮肤。
- R4. 公开首页、管理后台队伍/队员/项目页面的搜索筛选能力要有真正的前后端闭环。
- R5. 所有改动必须保持当前主色调、响应式行为和页面风格一致。

## Scope Boundaries

- 不重做全站主题。
- 不引入复杂的分页、全文检索或搜索服务。
- 不改动公开成长分析算法与成绩统计逻辑本身。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/swimmers/[slug]/page.tsx`: 公开个人详情页与分享导出入口。
- `frontend/src/components/shared/public-event-analytics-view.tsx`: 成长曲线、达标差距与目标模块的组合区。
- `frontend/src/app/page.tsx`: 公开首页队员列表，当前使用本地搜索和队伍过滤。
- `frontend/src/app/admin/teams/page.tsx`: 队伍列表页，当前搜索仅做本地过滤且表单使用原生 checkbox。
- `frontend/src/app/admin/swimmers/page.tsx`: 队员列表页，当前搜索/队伍筛选只做本地过滤，并有多个手写 `SelectContent` 组合。
- `frontend/src/app/admin/events/page.tsx`: 项目列表页，当前搜索只做本地过滤。
- `frontend/src/lib/api/admin.ts` / `frontend/src/lib/api/public.ts`: 当前列表 API client 尚未统一支持 `search` 参数。
- `backend/swimming_best/admin_routes.py` / `backend/swimming_best/public_routes.py`: 当前列表接口只部分支持筛选参数。
- `backend/swimming_best/repository.py`: 列表查询真实落点，适合统一收口搜索条件。

### Institutional Learnings

- 已有主 specs 明确要求共享 select 控件使用 Radix/shadcn 语义，项目级视觉自定义应建立在正确 primitive 之上。
- 公开成长页的完整导出和一致节奏已经是前一轮需求方向，本轮是在现有基础上进一步收束到“整页长图”。

## Key Technical Decisions

- **列表搜索统一补到接口层**
  - `teams`、`swimmers`、`events` 和 `public swimmers` 列表接口都增加可选 `search` 参数。
  - 页面仍保留即时输入体验，但展示结果来自真正识别查询条件的接口。

- **队员列表保留 team filter，但改用服务端查询结果驱动**
  - 后台队伍目录仍单独请求一次，用于表单和筛选按钮。
  - 队员实际列表根据 `teamId + search` 重新请求，避免前端本地状态和后端真实条件脱节。

- **公开首页使用“全量队伍选项 + 条件查询结果”双状态**
  - 先获取一次全量公开队员以生成队伍选项。
  - 当前展示列表根据队伍/搜索条件单独请求，保证条件有真实接口支持。

- **新增共享 Checkbox primitive 并替换原生 checkbox**
  - 后台页面里仍残留的原生 checkbox 改为共享 Radix checkbox 组件。
  - 手写 `SelectContent` 的地方补上 `SelectGroup`，保持 shared primitive 语义一致。

- **整页长图导出使用显式尺寸参数**
  - 公开成长页导出时读取容器的 `scrollWidth` / `scrollHeight`，并传给 `html-to-image` 的 `canvasWidth` / `canvasHeight`，避免长图被裁剪或缩放异常。

## Open Questions

### Resolved During Planning

- 是否需要把所有搜索框都改为服务端查询？主列表页需要，且这是本轮明确目标。
- 是否需要新增分享路由？不需要，继续在公开个人详情页内完成整页导出。
- 是否要引入 Radix checkbox？要，这是当前共享控件层中最明显的漂移点之一。

### Deferred to Implementation

- 对搜索输入做 debounce 还是 deferred value，按当前页面复杂度选择最低风险方案即可。
- 如果某个页面在测试中暴露出更多 primitive 漂移，再在实现时顺带补齐，但不主动扩大到全站所有文件。

## Implementation Units

- [ ] **Unit 1: Add query-backed search/filter support to admin and public list endpoints**

**Goal:** Make visible list filters and search boxes map to real backend query parameters.

**Requirements:** R4, R5

**Dependencies:** None

**Files:**
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Modify: `backend/swimming_best/admin_routes.py`
- Modify: `backend/swimming_best/public_routes.py`
- Modify: `backend/tests/test_admin_api.py`
- Modify: `backend/tests/test_public_api.py`

**Approach:**
- Extend repository list methods with optional `search` support:
  - `list_teams(search=...)`
  - `list_swimmers(team_id=..., search=...)`
  - `list_public_swimmers(team_id=..., search=...)`
  - `list_events(search=...)`
- Propagate the new parameter through service and route layers.
- Keep existing `teamId` filters intact and combine them with search where applicable.

**Patterns to follow:**
- Existing optional `teamId` query handling in `backend/swimming_best/admin_routes.py`
- Current repository clause-building pattern in `_list_swimmers`

**Test scenarios:**
- Happy path: `/api/admin/teams?search=` filters teams by name.
- Happy path: `/api/admin/swimmers?teamId=...&search=...` combines both filters.
- Happy path: `/api/admin/events?search=` filters events by display name.
- Happy path: `/api/public/swimmers?teamId=...&search=...` returns only matching visible swimmers.
- Edge case: empty search string behaves the same as no search parameter.

**Verification:**
- Backend routes return filtered data that matches the visible search/filter controls.

- [ ] **Unit 2: Wire public and admin list pages to real query parameters**

**Goal:** Ensure the visible search/filter UI on major list pages is backed by the new endpoint parameters.

**Requirements:** R4, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/admin/teams/page.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/admin/events/page.tsx`
- Modify: `frontend/src/lib/api/admin.test.ts`
- Modify: `frontend/src/lib/api/public.test.ts`

**Approach:**
- Extend frontend API client helpers to accept optional `search` and combined filter params.
- Update pages to issue list requests from current search/filter state instead of only filtering previously loaded arrays.
- Preserve full team options where needed by keeping a stable team directory source separate from filtered roster results.

**Patterns to follow:**
- Existing API helper query building in `frontend/src/lib/api/admin.ts`
- Existing state-driven filter controls in the admin/public pages

**Test scenarios:**
- Happy path: team page search updates the API request with `search`.
- Happy path: swimmer page search and team filter update the roster request together.
- Happy path: event page search updates the API request and returned list.
- Happy path: public home page search and team filter drive real public swimmer queries.
- Edge case: clearing filters returns to the full list without stale results.

**Verification:**
- Visible search/filter controls produce both URL/query-level intent and actual data changes.

- [ ] **Unit 3: Unify shared form primitive usage around Radix/shadcn semantics**

**Goal:** Remove remaining primitive drift in key form controls so pages read as one coherent UI family.

**Requirements:** R3, R5

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/ui/checkbox.tsx`
- Modify: `frontend/src/app/admin/teams/page.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/admin/goals/page.tsx`
- Modify: `frontend/src/components/shared/form-field.tsx`

**Approach:**
- Introduce a shared Radix-based checkbox component aligned with the existing theme.
- Replace the remaining raw native checkboxes in high-traffic admin forms.
- Add `SelectGroup` wrappers to manual `SelectContent` compositions that currently render `SelectItem` directly.

**Patterns to follow:**
- Existing `SelectField` wrapper in `frontend/src/components/shared/form-field.tsx`
- Shared button/input theming in `frontend/src/components/ui`

**Test scenarios:**
- Happy path: admin forms still submit the same boolean values after checkbox replacement.
- Happy path: manual select menus still render the same options after `SelectGroup` wrapping.
- Edge case: disabled or unchecked form states preserve current behavior.

**Verification:**
- Shared boolean/select controls use the same Radix/shadcn semantic layer and theme styling.

- [ ] **Unit 4: Polish public swimmer detail spacing and long poster export**

**Goal:** Make the public detail page read with consistent vertical rhythm and export as a full-page long image.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/swimmers/[slug]/page.tsx`
- Modify: `frontend/src/components/shared/public-event-analytics-view.tsx`
- Modify: `frontend/src/app/swimmers/[slug]/page.test.tsx`

**Approach:**
- Standardize the top-level spacing between hero, metric cards, and analytics sections.
- Ensure the export container covers the full growth page and that `toPng` receives explicit long-image dimensions.
- Keep navigation chrome and interactive-only controls excluded from export when appropriate.

**Patterns to follow:**
- Existing export filter pattern already used in `frontend/src/app/swimmers/[slug]/page.tsx`
- Current public card surfaces and motion conventions

**Test scenarios:**
- Happy path: export captures hero, metric cards, and analytics modules in one container.
- Happy path: export options pass explicit long-image dimensions.
- Edge case: loading state still blocks export safely until analytics is present.
- Integration: switching event still updates the exported long image content.

**Verification:**
- The saved image represents the full public growth page rather than a partial screenshot.

- [ ] **Unit 5: End-to-end verification and regression sweep**

**Goal:** Validate that style consistency and filter integrity both hold after the changes.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** Units 1-4

**Files:**
- Modify: `openspec/changes/page-style-and-filter-integrity/tasks.md`
- Test: `frontend/src/app/admin/teams/page.test.tsx`
- Test: `frontend/src/app/admin/swimmers/page.test.tsx`
- Test: `frontend/src/app/admin/events/page.test.tsx`

**Approach:**
- Extend page-level tests where helpful to ensure pages actually invoke filtered API queries.
- Run backend and frontend verification suites and fix any regressions before archive.

**Test scenarios:**
- Happy path: page-level search inputs trigger the expected API params.
- Happy path: backend list endpoints honor search and filter combinations.
- Integration: frontend lint, tests, backend tests, and frontend production build all pass.

**Verification:**
- No visible search/filter control in the targeted pages is decorative-only after this change.

## System-Wide Impact

- **Interaction graph:** visible search/filter UI -> API client query params -> admin/public list routes -> repository filtering.
- **Error propagation:** failed filtered fetches must still show existing toast/error states rather than leaving stale UI.
- **State lifecycle risks:** team option sources must stay stable even when current displayed swimmer list is filtered.
- **API surface parity:** frontend helper signatures and backend query params must stay aligned.
- **Unchanged invariants:** roster/team/event creation flows and analytics calculations do not change.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Query-backed search introduces extra request churn | Use deferred search values and keep filters focused to high-value pages only |
| Public home loses full team button list when results are filtered | Keep a stable team-option source separate from the currently displayed list |
| Shared checkbox replacement accidentally changes boolean submission behavior | Add focused form tests around the affected admin pages |

## Documentation / Operational Notes

- OpenSpec specs for roster/team/event/public portal/UI modernization all need to be updated together, because the visible behavior crosses those boundaries.
- If future pages add new visible search boxes, they should follow the same query-backed pattern established here.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-07-page-style-and-filter-integrity-requirements.md`
- Related code: `frontend/src/app/swimmers/[slug]/page.tsx`
- Related code: `frontend/src/app/page.tsx`
- Related code: `frontend/src/app/admin/teams/page.tsx`
- Related code: `frontend/src/app/admin/swimmers/page.tsx`
- Related code: `frontend/src/app/admin/events/page.tsx`
