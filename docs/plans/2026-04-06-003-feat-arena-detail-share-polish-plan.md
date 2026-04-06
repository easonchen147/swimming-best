---
title: feat: Refine arena detail hierarchy and public share export
type: feat
status: active
date: 2026-04-06
origin: docs/brainstorms/2026-04-06-arena-detail-share-polish-requirements.md
---

# feat: Refine arena detail hierarchy and public share export

## Overview

本次工作收束两个公开体验问题：一是竞技场页面去掉重复的“排行榜 + 详情”双主视图，改成详情优先的单一主体验；二是公开个人详情页修正模块间距并把分享导出升级成覆盖完整成长内容的可保存海报。

## Problem Frame

当前 `frontend/src/components/arena/arena-page.tsx` 里，赛道排行榜卡片和赛道详情卡片都在展示分组标签、排名和时间差，只是信息密度不同，导致页面存在明显重复。与此同时，`frontend/src/app/swimmers/[slug]/page.tsx` 的分享导出只绑定在顶部 `shareRef` 容器，导出的图片缺失三枚成绩卡和下方分析模块，不能体现“完整成长档案”的产品承诺。

## Requirements Trace

- R1. 竞技场应以赛道详情作为主视图，不再保留与其重复的并排缩略版。
- R2. 竞技场顶层指标要删除“焦点赛道”，改成更有解释力的指标。
- R3. 公开个人详情页的主模块上下间距需要统一。
- R4. 公开个人详情页的分享导出必须覆盖完整成长内容。
- R5. 新布局仍需保持当前公开页主色调、响应式行为和 shadcn/ui 组件风格。

## Scope Boundaries

- 不新增新的独立竞技场产品模式。
- 不重做公开分享为外链发布系统。
- 不改动后端竞技场分组边界逻辑。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/components/arena/arena-page.tsx`: 当前竞技场主页面，已包含筛选、概览卡、排行榜和详情面板。
- `frontend/src/components/arena/arena-leaderboards.tsx`: 当前赛道排行榜卡片列表，实现重复信息的主要来源。
- `backend/swimming_best/services.py`: 竞技场分组与排序逻辑已经稳定，当前不需要后端改协议。
- `frontend/src/app/swimmers/[slug]/page.tsx`: 公开个人详情页，当前 `shareRef` 只包裹顶部主卡。
- `frontend/src/components/shared/public-event-analytics-view.tsx`: 成长曲线、达标差距、等级和目标模块的统一组合区。
- `frontend/src/app/swimmers/[slug]/share/[eventId]/page.tsx`: 现有分享页，提供高质量导出与分享版容器的视觉参考。

### Institutional Learnings

- 当前公开页与后台页都在使用统一主色调和 shadcn/Radix 组件包装层，不应引入另一套视觉语言。
- 竞技场相关单测已落在 `frontend/src/app/compare/page.test.tsx`，这里应随视图职责变化同步更新。

## Key Technical Decisions

- **竞技场改为“列表切换 + 单详情面板”**：保留赛道分组切换能力，但左侧不再渲染重复的 Top 3 榜单卡，而改成更轻量的赛道概览选择器。
- **删除“焦点赛道”概览卡**：以“当前赛道热度”或“头名优势”替换，直接解释当前选中赛道。
- **为公开个人详情页建立统一分享容器**：将顶部 Hero、指标卡和分析视图都纳入同一个可导出容器，必要时为导出态追加背景和内边距。
- **统一垂直节奏**：通过页级 section 间距控制，不在各个组件内部各自硬编码不同的外边距。

## Open Questions

### Resolved During Planning

- 是否需要改后端竞技场接口？否，本轮用现有 `groups` 数据足够支撑。
- 是否删除赛道详情而保留排行榜？否，保留详情，弱化排行榜。
- 是否继续只导出顶部主卡？否，导出完整成长容器。

### Deferred to Implementation

- 替换“焦点赛道”的最终指标文案在实现中结合实际卡片密度微调，但应保持解释力优先。
- 赛道概览切换器的具体视觉形态可以在实现中根据移动端空间选择列表或胶囊卡片。

## Implementation Units

- [ ] **Unit 1: Refine arena page into a detail-first layout**

**Goal:** Remove duplicated arena information by making race detail the primary view and turning group switching into a lighter navigation surface.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/components/arena/arena-page.tsx`
- Modify: `frontend/src/components/arena/arena-leaderboards.tsx`
- Modify: `frontend/src/app/compare/page.test.tsx`
- Modify: `frontend/e2e/responsive-compare.spec.ts`

**Approach:**
- Replace the current two-column “leaderboard cards + detail card” composition with:
  - top summary metrics
  - a lighter race selector surface
  - one richer race detail panel
- Move any truly useful metadata from the old leaderboard cards into the main detail panel.
- Remove the “焦点赛道” summary card and replace it with a metric tied to the selected group, such as heat label or leader gap.
- Keep existing gender / pool length / project filters intact.

**Patterns to follow:**
- Current public surface tokens and summary cards in `frontend/src/components/arena/arena-page.tsx`
- Responsive stacking pattern already used in public analytics pages

**Test scenarios:**
- Happy path: arena page renders a selected race detail without also rendering duplicate Top 3 leaderboard cards.
- Happy path: selecting another race group updates the main detail panel and selected-group metric card.
- Edge case: filtered empty result still shows a stable empty state.
- Integration: mobile viewport keeps the group selector and detail panel readable without horizontal overflow.

**Verification:**
- Arena page reads as one primary analysis surface instead of two similar modules competing for attention.

- [ ] **Unit 2: Normalize public swimmer detail spacing and share capture scope**

**Goal:** Make the public swimmer detail page visually consistent and ensure share export captures the whole growth story.

**Requirements:** R3, R4, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/swimmers/[slug]/page.tsx`
- Modify: `frontend/src/components/shared/public-event-analytics-view.tsx`

**Approach:**
- Wrap the top hero, metric cards, and analytics view inside a single export container instead of exporting only the hero section.
- Normalize vertical spacing between:
  - hero card
  - three metric cards
  - analytics section
- If full-page export height becomes too tall, introduce a dedicated export-ready composition inside the same page rather than trimming to first screen only.

**Patterns to follow:**
- Card spacing rhythm already used in `frontend/src/app/swimmers/[slug]/share/[eventId]/page.tsx`
- Shared analytics composition in `frontend/src/components/shared/public-event-analytics-view.tsx`

**Test scenarios:**
- Happy path: clicking save on the public swimmer detail page exports a container that includes hero, metrics, and analytics modules.
- Happy path: module spacing remains visually consistent on desktop and mobile layouts.
- Edge case: export action degrades gracefully when analytics is still loading.
- Integration: share export still succeeds after switching the selected event.

**Verification:**
- Exported image contains the same core content hierarchy users see on the page, not just the top card.

- [ ] **Unit 3: Align copy, polish metrics, and preserve responsive behavior**

**Goal:** Keep the revised public surfaces coherent in wording, metrics, and responsive presentation.

**Requirements:** R2, R5

**Dependencies:** Unit 1, Unit 2

**Files:**
- Modify: `frontend/src/components/arena/arena-page.tsx`
- Modify: `frontend/src/components/layout/public-shell.tsx` (only if supporting copy needs adjustment)
- Test: `frontend/src/app/compare/page.test.tsx`

**Approach:**
- Reword any remaining arena copy that still implies “排行榜和详情是两个并列主功能”。
- Ensure the replacement metric for “焦点赛道” is tied to current selection and can be explained by users at a glance.
- Keep layout wrapping and card density aligned with current public-shell responsive behavior.

**Test scenarios:**
- Happy path: replacement metric displays stable selected-race information instead of the first filtered event name.
- Edge case: when no race is selected, the replacement metric falls back to a clear empty value.
- Integration: public navigation and arena layout continue to render correctly on narrow viewports.

**Verification:**
- Public copy, metric meaning, and responsive card behavior remain internally consistent after the restructure.

## System-Wide Impact

- **Interaction graph:** Arena filters -> selected race group -> primary detail surface; Swimmer detail selected event -> analytics fetch -> export container snapshot.
- **Error propagation:** Empty arena results and export failures should continue to surface explicit empty/error states rather than blank panels.
- **State lifecycle risks:** Selected arena group and selected swimmer event must remain stable when filters or exports change.
- **Unchanged invariants:** Arena comparisons still remain within aligned event / pool length / gender scopes; public event analytics content itself is not being redefined.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Removing the old leaderboard cards makes race switching less obvious | Replace them with a lighter but still clearly tappable selector surface |
| Full-content export becomes too tall on some devices | Use a dedicated export container with controlled width and padding rather than capturing the raw viewport |
| Selected-race metric becomes overly specific or verbose | Prefer one interpretable metric tied to the selected group, such as heat label or leader gap |

## Documentation / Operational Notes

- If README or screenshots later document the arena layout, they should reflect the detail-first structure.
- Export guidance should clarify that the public detail page now saves a full growth poster.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-06-arena-detail-share-polish-requirements.md`
- Related code: `frontend/src/components/arena/arena-page.tsx`
- Related code: `frontend/src/app/swimmers/[slug]/page.tsx`
- Related code: `frontend/src/app/swimmers/[slug]/share/[eventId]/page.tsx`
