---
title: feat: Add public arena market board
type: feat
status: active
date: 2026-04-06
origin: docs/brainstorms/2026-04-06-arena-market-requirements.md
---

# feat: Add public arena market board

## Overview

将现有公开“对比页”升级为“竞技场”产品。核心不是继续让用户选择两位学员看折线图，而是提供一个按赛道聚合的公开竞技市场板，先展示各赛道的竞争热度和头部学员，再展开某个赛道的详细榜单。

## Problem Frame

当前 `frontend/src/app/compare/page.tsx` 是一个工具页，不是一个公开门户页。用户必须先知道要看谁，再知道要看哪个项目，才能触发 `backend/swimming_best/services.py` 里的 compare 逻辑。这个模型无法承载“跨多个赛道发现最有竞争力学员”的需求，也无法形成你要的市场热力图体验。

本次改造的目标是让访客进入页面后先看到整个公开竞技市场的结构，并且始终在“同项目、同池长、同性别”的边界内浏览竞争关系。

## Requirements Trace

- R1. 公开“对比”入口升级为“竞技场”，用户可见标题、按钮和页面语义都改为竞技场。
- R2. 竞技场默认展示按赛道聚合的热力市场板，而不是两人对比图。
- R3. 每个赛道必须严格限定为同项目、同池长、同性别。
- R4. 页面必须突出每个赛道里最具竞争力的头部学员，并可查看赛道详细榜单。
- R5. 必须保持当前站点的主色调、shadcn/ui 风格和移动端兼容性。
- R6. 旧 `/compare` 链接不能直接失效。

## Scope Boundaries

- 不做跨项目综合评分。
- 不做实时推送或行情轮播。
- 不把公开竞技场做成纯表格页。
- 不在本轮移除现有 compare 后端逻辑，允许先保留为兼容层。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/compare/page.tsx`: 当前 compare 页面，适合作为原入口语义的替换点。
- `frontend/src/components/charts/compare-chart.tsx`: 现有两人趋势图，仅可作为赛道详情里的次级参考，不适合作为竞技场主视图。
- `frontend/src/components/layout/public-shell.tsx`: 公开页顶部按钮入口，需要把“对比”改成“竞技场”。
- `frontend/src/lib/api/public.ts`: 公开 API client，当前只有 `/api/public/compare`，需要新增竞技场聚合接口。
- `backend/swimming_best/public_routes.py`: 公开路由入口，适合新增 `/api/public/arena`。
- `backend/swimming_best/services.py`: 当前 compare 聚合逻辑在这里，竞技场聚合也应在这里集中。
- `backend/swimming_best/repository.py`: 当前仓库层已具备公开泳者、事件、成绩查询能力，且业务逻辑集中，适合新增赛道聚合查询。

### Institutional Learnings

- 公开能力应建立在现有 `public-performance-portal` 和 `responsive-ui` 约束上，避免做成第二套视觉系统。
- 后端仓库层很重，跨多表统计应优先集中在 `repository.py`，而不是散落在 routes。

### External References

- Recharts Treemap 适合实现类似股票市场的热力板。
- 当前项目已经采用 shadcn/Radix primitives，竞技场筛选与详情组件应继续建立在这些 primitives 上。

## Key Technical Decisions

- **主入口语义升级，但保留兼容路径**：新增 `frontend/src/app/arena/page.tsx` 作为主入口，`frontend/src/app/compare/page.tsx` 改为跳转到 `/arena`。
- **热力图单元就是赛道**：一个单元对应 `event_id + swimmer.gender`，其中 `event_id` 已天然区分长池/短池。
- **面积和颜色分工明确**：Treemap 面积表示有效竞争人数，颜色表示赛道竞争热度，不直接比较绝对秒数。
- **详情面板替代旧 compare 主视图**：点击热力单元后展示该赛道榜单、头名优势、Top N 学员；旧 CompareChart 仅在需要时作为详情附属信息，而不是主角。
- **未知性别不进入竞技场主盘**：`gender = unknown` 的学员从竞技场主赛道聚合中排除，避免破坏男/女分区的严格性。

## Open Questions

### Resolved During Planning

- **竞技场是否仍然建立在“两人选择”上？** 否，竞技场改为公开市场板优先。
- **是否需要新路由？** 是，主入口用 `/arena`，旧 `/compare` 做兼容跳转。
- **赛道是否必须拆分男女与池长？** 是，属于硬约束。

### Deferred to Implementation

- **是否在赛道详情里保留小型趋势图？** 可选。若实现成本低，可补一张轻量图；若影响首版完成度，可先只做榜单和摘要。
- **热度分数公式具体参数**：在实现阶段根据现有数据分布微调，但必须保持“相对指标，不跨项目比较”的原则。

## High-Level Technical Design

> This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.

```text
public nav "竞技场"
        |
        v
/arena page
  -> load arena board API
  -> render filters (gender / pool length / team)
  -> render treemap cells by arena group
  -> select one arena group
  -> render leaderboard + leader gap + optional trend snippet

arena group key
  = public swimmer best performances
  grouped by (event_id, swimmer.gender)

arena tile
  - event display name
  - gender
  - competitor count
  - leader swimmer
  - leader best time
  - heat score
```

## Implementation Units

- [ ] **Unit 1: Add public arena aggregate backend**

**Goal:** Provide a public aggregate endpoint that returns arena groups built from public swimmers' best valid performances.

**Requirements:** R2, R3, R4

**Dependencies:** None

**Files:**
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Modify: `backend/swimming_best/public_routes.py`
- Modify: `backend/tests/test_public_api.py`

**Approach:**
- Add a repository query that returns each public swimmer's best valid time per event, with swimmer gender, team, and event metadata.
- Group those rows in `PublicService` by `(event_id, gender)` to form arena groups.
- Exclude `gender = unknown` from the main board.
- Compute per-group metrics:
  - `competitorCount`
  - `leader`
  - `leaderGapMs`
  - `leaderGapPercent`
  - `heatScore`
  - `rankings`
- Expose the result through a new `GET /api/public/arena` endpoint that accepts optional `gender`, `poolLengthM`, and `teamId`.

**Patterns to follow:**
- `PublicService.compare` in `backend/swimming_best/services.py`
- public route structure in `backend/swimming_best/public_routes.py`

**Test scenarios:**
- Happy path: public arena endpoint returns grouped race arenas with leader and rankings for visible swimmers.
- Happy path: pool length filter returns only 25m or 50m race arenas.
- Happy path: gender filter returns only male or female race arenas.
- Edge case: swimmers with `unknown` gender do not appear in arena groups.
- Edge case: groups with only one competitor still render with competitor count and neutral heat.
- Integration: best valid time per swimmer per event is used, not every raw performance row.

**Verification:**
- API returns stable grouped payloads for mixed public data and respects filters.

- [ ] **Unit 2: Add arena frontend route and navigation**

**Goal:** Replace user-facing “对比” semantics with “竞技场” while preserving backwards compatibility.

**Requirements:** R1, R6

**Dependencies:** Unit 1

**Files:**
- Create: `frontend/src/app/arena/page.tsx`
- Modify: `frontend/src/app/compare/page.tsx`
- Modify: `frontend/src/components/layout/public-shell.tsx`
- Modify: `frontend/src/components/layout/public-shell.test.tsx`
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/lib/types.ts`

**Approach:**
- Add a new arena page under `/arena`.
- Change public navigation label from “对比” to “竞技场”.
- Keep `/compare` as compatibility route that redirects to `/arena`.
- Add typed arena payloads and frontend API client function.

**Patterns to follow:**
- current public shell button navigation in `frontend/src/components/layout/public-shell.tsx`
- existing client typing style in `frontend/src/lib/types.ts`

**Test scenarios:**
- Happy path: public header shows “竞技场” button and links to the new arena entry.
- Happy path: visiting `/compare` redirects to `/arena`.
- Integration: arena page fetches the new public arena payload successfully.

**Verification:**
- User-facing entry text no longer says “对比”, but legacy `/compare` still resolves.

- [ ] **Unit 3: Build arena market board UI**

**Goal:** Render a stock-market-like heatmap board that shows competitive leaders by race arena.

**Requirements:** R2, R3, R4, R5

**Dependencies:** Unit 2

**Files:**
- Create: `frontend/src/components/arena/arena-heatmap.tsx`
- Create: `frontend/src/components/arena/arena-detail-panel.tsx`
- Create: `frontend/src/components/arena/arena-filters.tsx`
- Modify: `frontend/src/app/arena/page.tsx`
- Test: `frontend/src/app/arena/page.test.tsx`

**Approach:**
- Use shadcn cards, badges, selects, and buttons for filters and detail panels.
- Use Recharts `Treemap` to build the arena heatmap board.
- Map tile area to competitor count and tile color to `heatScore`.
- Each tile displays:
  - event display name
  - gender
  - leader name
  - best time
- Selecting a tile populates a detail card with:
  - leaderboard
  - leader advantage
  - competitiveness summary
  - optional mini trend snippet if implementation remains low-risk

**Technical design:** *(directional guidance)*

```text
page layout
  hero / title
  filter rail
  treemap board
  selected arena detail

selected arena fallback
  first visible arena after filtering
```

**Patterns to follow:**
- public page surface styling in `frontend/src/app/compare/page.tsx`
- card/badge/filter composition used in current public and admin pages

**Test scenarios:**
- Happy path: arena page renders treemap tiles from API groups.
- Happy path: clicking a tile updates the selected detail panel.
- Happy path: leaderboard shows only swimmers from the selected arena.
- Edge case: empty filters show a stable empty state instead of a broken chart.
- Edge case: mobile viewport does not overflow horizontally.
- Integration: tile labels distinguish short-course and long-course events correctly.

**Verification:**
- Arena page reads as a market board first, detailed leaderboard second, on desktop and mobile.

- [ ] **Unit 4: Retire old compare-first mental model**

**Goal:** Remove the old “select two swimmers first” compare UX from the public flow.

**Requirements:** R1, R2

**Dependencies:** Unit 3

**Files:**
- Modify: `frontend/src/app/compare/page.test.tsx`
- Modify: `frontend/e2e/responsive-compare.spec.ts`
- Modify: `frontend/e2e/admin-quick-record.spec.ts` (only if route assumptions are affected)

**Approach:**
- Update existing compare-focused tests to the new arena semantics.
- Ensure no user-facing copy still positions this page as a two-swimmer compare tool.

**Test scenarios:**
- Happy path: arena entry and headings use “竞技场” copy consistently.
- Integration: browser tests cover arena load and responsive behavior.
- Test expectation: none -- no backend behavior change beyond already covered aggregate API assertions.

**Verification:**
- The public feature is understood as “竞技场” throughout navigation, page title, and browser tests.

## System-Wide Impact

- **Interaction graph:** Public nav -> `/arena` page -> `/api/public/arena` aggregate -> optional detail panel selection
- **Error propagation:** Empty or filtered-out payloads must produce stable empty states, not treemap crashes
- **State lifecycle risks:** Selected arena must reset predictably when filters change
- **API surface parity:** `/compare` stays as compatibility route, but main public semantics shift to arena
- **Integration coverage:** Need end-to-end confirmation that filters, treemap, and detail panel remain responsive and do not overflow on mobile
- **Unchanged invariants:** Individual swimmer pages and event analytics remain personal-growth views, not replaced by the arena

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Heat score feels arbitrary | Use explicit relative metrics and describe them in UI microcopy |
| Too many tiles make labels unreadable on mobile | Add stronger filters and stacked detail behavior on small screens |
| Unknown-gender swimmers disappear from the board unexpectedly | Exclude them intentionally and keep that rule explicit in backend + tests |
| Existing `/compare` links break | Redirect `/compare` to `/arena` |

## Documentation / Operational Notes

- Update public navigation wording in user-facing docs if compare terminology is referenced elsewhere.
- Keep the arena color system inside the existing theme tokens; no new palette branch.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-06-arena-market-requirements.md`
- Related code: `frontend/src/app/compare/page.tsx`
- Related code: `frontend/src/components/charts/compare-chart.tsx`
- Related code: `backend/swimming_best/services.py`
