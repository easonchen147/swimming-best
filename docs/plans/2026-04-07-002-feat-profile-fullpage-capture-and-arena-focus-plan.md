---
title: feat: Replace profile poster export with full-page capture and focus arena detail
type: feat
status: active
date: 2026-04-07
origin: docs/brainstorms/2026-04-07-profile-fullpage-capture-and-arena-focus-requirements.md
---

# feat: Replace profile poster export with full-page capture and focus arena detail

## Overview

把公开个人档案页的“保存分享海报”替换为稳定的整页长图导出能力，同时把竞技场页面收束为“赛道详情单主视图”，并在榜单前三加入主题内的层级强化。

## Problem Frame

当前 `frontend/src/app/swimmers/[slug]/page.tsx` 仍然使用 `toPng` 直接对页面容器做导出，但用户反馈实际结果是空白，说明“现有海报导出”已经不能作为可靠功能继续保留。竞技场页 `frontend/src/components/arena/arena-page.tsx` 则把“赛道切换”单独做成左侧块级区域，导致主视图和切换区并列竞争注意力。

## Requirements Trace

- R1. 公开个人档案页要移除旧的“保存分享海报”语义。
- R2. 公开个人档案页要支持整页成长长图导出。
- R3. 竞技场页要去掉独立“赛道切换”卡片，把切换能力收进详情区。
- R4. 赛道详情榜单前三要有明显但克制的视觉强化。
- R5. 所有改动保持当前主色调、共享组件语义和响应式兼容。

## Scope Boundaries

- 不引入系统级截图权限或浏览器扩展能力。
- 不改动竞技场后端筛选协议。
- 不重做分享路由产品结构。

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/swimmers/[slug]/page.tsx`: 公开个人档案页，当前导出按钮和导出容器都在这里。
- `frontend/src/app/swimmers/[slug]/share/[eventId]/page.tsx`: 现有分享页，可复用其更稳定的静态导出构图思路。
- `frontend/src/components/shared/public-event-analytics-view.tsx`: 档案页成长分析区的主体内容。
- `frontend/src/components/arena/arena-page.tsx`: 当前竞技场主布局，含独立“赛道切换”卡片。
- `frontend/src/components/arena/arena-leaderboards.tsx`: 当前赛道切换内容与概览卡片来源。
- `frontend/src/app/compare/page.test.tsx`: 竞技场当前单测入口。
- `frontend/src/app/swimmers/[slug]/page.test.tsx`: 档案页导出当前测试入口。

### Key Technical Decisions

- **档案页导出改为“专用长图导出容器”**
  - 不再直接依赖当前可交互页面容器做截图。
  - 使用一个 export-only 的稳定长图容器来生成图片，避免当前页面动效、滚动、交互按钮导致空白或不稳定。

- **用户可见动作改名**
  - 按钮从“保存分享海报”切换为“下载整页长图”或同等明确语义。
  - 旧语义直接移除，不做兼容双按钮。

- **竞技场采用单卡主视图**
  - 删除独立的“赛道切换”卡片。
  - 在赛道详情卡头部或正文顶部增加轻量赛道切换带，保留切换能力但不再分裂主视图。

- **前三名用主题内层级强化**
  - Top 1: 最强强调，允许轻微高光/呼吸动效。
  - Top 2 / 3: 次级强调，使用银/铜感标签与轻微动效。
  - 其他名次保持当前稳定排版。

## Open Questions

### Resolved During Planning

- 整页长图是否需要系统截图 API？不需要，使用整页导出容器实现。
- 是否保留“保存分享海报”文案？不保留，直接替换为新的长图导出语义。
- 竞技场是否仍保留分组切换能力？保留，但不再用独立卡片承载。

### Deferred to Implementation

- 长图按钮最终文案可在实现时根据版面空间微调，但必须体现“整页长图”语义。
- 前三名动画强度可在实现时按当前页面动效密度微调，但不能偏离现有主题。

## Implementation Units

- [ ] **Unit 1: Replace profile poster export with full-page long image export**

**Goal:** Remove the unreliable poster-save action and replace it with a stable full-page long image export on the public swimmer detail page.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/swimmers/[slug]/page.tsx`
- Modify: `frontend/src/app/swimmers/[slug]/page.test.tsx`

**Approach:**
- Replace the current visible export action label and handler.
- Introduce a stable export-only long-image container that mirrors the current page content.
- Exclude interactive-only controls from the exported content.
- Keep the visible page layout unchanged except for the action wording and any spacing needed to support the new export semantics.

**Test scenarios:**
- Happy path: clicking the new export action triggers one image export against the dedicated long-image container.
- Happy path: the export container includes hero, summary metrics, and analytics content.
- Edge case: export is disabled or guarded until analytics data is available.

**Verification:**
- The exported file reflects the full current profile page content rather than a blank or partial snapshot.

- [ ] **Unit 2: Restructure arena into a single focused detail surface**

**Goal:** Remove the standalone race-switch card and integrate race selection into the detail view itself.

**Requirements:** R3, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/components/arena/arena-page.tsx`
- Modify: `frontend/src/components/arena/arena-leaderboards.tsx`
- Modify: `frontend/src/app/compare/page.test.tsx`

**Approach:**
- Collapse the two-column “switch + detail” structure into one main detail card.
- Move the group-switching UI into the detail card as a compact selector rail or embedded group strip.
- Keep the current filters and selected-group behavior intact.

**Test scenarios:**
- Happy path: arena page no longer renders a separate heading/card for “赛道切换”.
- Happy path: visitors can still switch race groups from inside the detail surface.
- Edge case: empty filter results still show a stable detail empty state.

**Verification:**
- Arena reads as one focused analysis surface, not a split control+detail layout.

- [ ] **Unit 3: Add podium emphasis for top three rankings**

**Goal:** Give the top three ranked swimmers a clearer visual hierarchy inside the arena detail list.

**Requirements:** R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/components/arena/arena-page.tsx`
- Modify: `frontend/src/app/compare/page.test.tsx`

**Approach:**
- Add theme-aligned podium badges, glow, or motion accents for ranks 1-3.
- Keep the effect restrained and readable on both desktop and mobile.

**Test scenarios:**
- Happy path: top three entries render with distinct podium markers.
- Edge case: groups with fewer than three swimmers still render gracefully.

**Verification:**
- Rank 1-3 are visually more prominent than the rest without looking disconnected from the page theme.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Export-only container drifts from visible page over time | Reuse the same content composition instead of hand-maintaining a second, unrelated layout |
| Arena loses discoverability if switching UI becomes too subtle | Keep a clear, inline race selector strip inside the main detail card |
| Top-three animations become visually noisy | Limit motion to small-scale pulses/highlights and keep badges theme-bound |

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-07-profile-fullpage-capture-and-arena-focus-requirements.md`
- Related code: `frontend/src/app/swimmers/[slug]/page.tsx`
- Related code: `frontend/src/app/swimmers/[slug]/share/[eventId]/page.tsx`
- Related code: `frontend/src/components/arena/arena-page.tsx`
