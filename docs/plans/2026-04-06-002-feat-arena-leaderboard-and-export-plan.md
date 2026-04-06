---
title: feat: Replace arena heatmap with leaderboard and add summary export
type: feat
status: active
date: 2026-04-06
origin: docs/brainstorms/2026-04-06-arena-leaderboard-and-export-requirements.md
---

# feat: Replace arena heatmap with leaderboard and add summary export

## Overview

把当前竞技场从热力图视图改成多维排行榜系统，并新增一类“成绩简报模板”导出，让管理员能够导出更适合阅读和分享的队员成绩概览。

## Problem Frame

当前竞技场虽然已经具备赛道聚合能力，但热力图不是用户真正需要的主视图。用户更关心的是相同项目、相同池长、相同性别下的明确排位，以及在年龄段与总榜视角之间切换时，队员的表现如何变化。

另一方面，当前导出能力仍主要服务于原始数据外发，缺少对国家等级、里程碑、短期进步和突出成绩的摘要表达。

## Requirements Trace

- R1. 竞技场主视图改为排行榜，不再以热力图作为主交互。
- R2. 排名仍然必须严格锁定在同项目、同池长、同性别边界。
- R3. 排行支持按年龄段或不区分年龄切换。
- R4. 保留导出原始数据能力，同时新增成绩简报模板导出。
- R5. 简报导出要突出国家等级、目标里程碑和近期进步亮点。
- R6. 新页面与导出模板继续保持当前主色调和 UI 体系。

## Scope Boundaries

- 不做跨项目综合评分。
- 不做实时榜单更新。
- 不做复杂模板编辑器。
- 不移除原始 CSV 导出，只做增强和补充。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/components/arena/arena-page.tsx`: 当前竞技场页面，可直接替换主视图区域。
- `backend/swimming_best/services.py::arena_board`: 已经有赛道聚合能力，可升级为榜单视图后端数据来源。
- `backend/swimming_best/import_export.py`: 当前原始 CSV 导出逻辑集中在这里，适合新增摘要导出能力。
- `frontend/src/app/swimmers/[slug]/share/[eventId]/page.tsx`: 已有分享卡片页面，可参考其“摘要化呈现”的版式与导出路径。
- `frontend/src/components/shared/public-event-analytics-view.tsx`: 已经具备目标、等级、趋势这些摘要信息的前端组合模式。

### Institutional Learnings

- 公开能力与导出能力都应建立在当前 shadcn/ui 组件体系与既有主色调上。
- 后端业务逻辑应优先集中在 `services.py` / `repository.py` 与 `import_export.py`，不要把大量汇总逻辑散在 route 层。

## Key Technical Decisions

- **竞技场改为榜单看板，不再保留热力图主视图**：热力图组件删除或降级为历史实现，不再作为主入口展示。
- **年龄维度使用年龄桶而不是裸年龄**：以后端统一计算年龄桶，避免前后端口径漂移。
- **榜单模式支持 `male / female / all`**：其中 `all` 是公开总榜视角，不等同于标准比赛分组。
- **导出拆成两类**：
  - 原始 CSV 导出继续保留
  - 新增摘要型导出模板，优先以 HTML 报告页 / 可截图模板方式落地

## Open Questions

### Resolved During Planning

- 是否保留热力图主视图？否。
- 是否继续支持年龄不区分？是，作为榜单模式之一。
- 是否仅增强 CSV？否，新增摘要导出模板。

### Deferred to Implementation

- 年龄桶的具体边界值可在实现时整理成一个集中 helper。
- 摘要导出优先落成 HTML 模板页还是可下载文件，可根据现有实现成本选最稳方案，但必须是“摘要视图”，不能只加 CSV 列。

## High-Level Technical Design

> This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.

```text
Arena page
  -> filters: gender / pool length / age mode / age bucket / team
  -> leaderboard cards by event group
  -> selected event leaderboard detail

arena ranking row source
  = public swimmer best performance
  grouped by (event_id, ranking_gender_mode, age_bucket?)

Export template
  -> read swimmer performance history + goals + official grade
  -> compute highlights
  -> render one summary template
  -> allow admin to open / print / screenshot
```

## Implementation Units

- [ ] **Unit 1: Replace arena heatmap with leaderboard-oriented data contract**

**Goal:** Extend arena data so the frontend can render leaderboard-first views with optional age segmentation.

**Requirements:** R1, R2, R3

**Dependencies:** None

**Files:**
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Modify: `backend/swimming_best/public_routes.py`
- Modify: `backend/tests/test_public_api.py`

**Approach:**
- Reuse the current public best-performance aggregation.
- Add optional ranking mode inputs:
  - `gender = male | female | all`
  - `poolLengthM`
  - `teamId`
  - `ageMode = grouped | all`
  - `ageBucket`
- Group leaderboard rows by event, then optionally by age bucket.
- Return ordered leaderboard groups instead of heat-oriented metadata being the primary focus.

**Test scenarios:**
- Happy path: arena API returns leaderboard groups ordered by best time.
- Happy path: `gender=all` returns combined leaderboard groups.
- Happy path: age bucket filter returns only swimmers inside the requested bucket.
- Edge case: unknown-gender swimmers are excluded from male/female grouped rankings.
- Integration: leaderboard groups still do not merge incompatible events or pool lengths.

**Verification:**
- Backend payload can drive a leaderboard page without requiring heatmap-only fields.

- [ ] **Unit 2: Rebuild arena page into leaderboard market**

**Goal:** Replace the heatmap board with leaderboard-first public UI that still feels like part of the current product.

**Requirements:** R1, R2, R3, R6

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/components/arena/arena-page.tsx`
- Modify: `frontend/src/app/arena/page.tsx`
- Modify: `frontend/src/app/compare/page.tsx`
- Modify: `frontend/src/components/layout/public-shell.tsx`
- Modify: `frontend/src/app/compare/page.test.tsx`
- Modify: `frontend/e2e/responsive-compare.spec.ts`

**Approach:**
- Remove the heatmap as the primary arena visualization.
- Render leaderboard cards by event group, with filters for sex, pool length, age mode, and team.
- Keep the current side/detail panel idea, but anchor it to a selected leaderboard group.
- Rename all public compare-facing copy to “竞技场”.

**Patterns to follow:**
- Existing public card and badge surfaces in `frontend/src/components/arena/arena-page.tsx`
- Shared filter controls from `frontend/src/components/shared/form-field.tsx`

**Test scenarios:**
- Happy path: arena page renders leaderboard groups without heatmap.
- Happy path: switching gender and age mode updates the rendered groups.
- Happy path: `/compare` still resolves to the arena page.
- Edge case: empty ranking result renders a stable empty state.
- Integration: mobile viewport keeps leaderboard readable without horizontal overflow.

**Verification:**
- Arena page now reads as a ranking market, not a chart experiment.

- [ ] **Unit 3: Add summary export template**

**Goal:** Introduce a richer export/report template that highlights a swimmer's strongest performances and milestones.

**Requirements:** R4, R5, R6

**Dependencies:** Unit 1

**Files:**
- Modify: `backend/swimming_best/import_export.py`
- Modify: `backend/swimming_best/admin_routes.py`
- Modify: `backend/swimming_best/services.py`
- Create: `frontend/src/app/admin/export/swimmers/[swimmerId]/summary/page.tsx`
- Create: `frontend/src/components/export/swimmer-summary-report.tsx`
- Modify: `frontend/src/lib/api/admin.ts`
- Test: `backend/tests/test_public_api.py` or dedicated export tests

**Approach:**
- Keep existing CSV exports untouched.
- Add a second export/report path for swimmer summary.
- Compute:
  - strongest events
  - current national grade / next grade gap
  - achieved goals / next goal
  - recent 30-day / 90-day progress
  - standout improvement callouts
- Render these in a shareable summary template rather than raw table rows.

**Test scenarios:**
- Happy path: summary export payload includes strongest events and current grade data.
- Happy path: goal and milestone summaries appear when data exists.
- Edge case: swimmers without goals or official grade still render a complete summary with fallbacks.
- Integration: existing CSV export routes continue to work unchanged.

**Verification:**
- A coach or parent can understand the swimmer's highlights from one summary page without reading raw CSV lines.

## System-Wide Impact

- **Interaction graph:** public arena filters now affect leaderboard grouping rather than heat tiles.
- **Error propagation:** missing age data must degrade gracefully into “不分年龄” buckets rather than breaking the board.
- **API surface parity:** `/compare` remains a compatibility surface while user-facing semantics move fully to arena.
- **Integration coverage:** export summary must reuse the same grade/goal/progress logic already used in analytics surfaces.
- **Unchanged invariants:** raw CSV export remains available for system-level data handling.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Age-bucket logic becomes inconsistent between backend and frontend | Centralize age bucket computation in backend payloads |
| Leaderboard groups become too dense on mobile | Default to collapsed cards and selected-group detail panel |
| Export summary duplicates analytics logic in multiple places | Reuse existing service-layer calculations where possible |

## Documentation / Operational Notes

- Public navigation wording and screenshots in docs should reflect “竞技场” as leaderboard space, not heatmap space.
- Export instructions in README or backend docs may need a short note once summary export exists.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-06-arena-leaderboard-and-export-requirements.md`
- Related code: `frontend/src/components/arena/arena-page.tsx`
- Related code: `backend/swimming_best/import_export.py`
