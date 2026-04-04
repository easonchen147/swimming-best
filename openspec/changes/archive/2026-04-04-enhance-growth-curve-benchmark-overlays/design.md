## Context

Public swimmer analytics already expose raw performance data, PB/trend series, current official grade status, custom standards, and public goals. The missing piece is composition: official grades and goals are fragmented into side panels, while the chart only shows custom benchmark lines, so the main "growth" view does not answer the event-specific coaching question quickly.

This change touches both backend analytics contracts and frontend public analytics rendering. The implementation must keep the current public API easy to consume, preserve custom standard behavior, and stay readable on phone-sized viewports where most parents will open the page.

## Goals / Non-Goals

**Goals:**
- Return enough public analytics data to render a single event-specific growth view with official grade lines, public goal lines, and existing custom standards.
- Show explicit remaining-gap information for each public goal and each applicable official grade tier.
- Upgrade the chart from a delta-only view to a readable progression chart that still highlights PB progress.
- Keep public swimmer detail and event detail pages usable on mobile without horizontal overflow.

**Non-Goals:**
- Redesign the admin goal/standards management workflows.
- Introduce new persistence tables or change how official baseline data is stored.
- Add cross-event comparisons or predictive modeling for future results.

## Decisions

### Decision: Extend the existing public analytics payload instead of creating a separate benchmark endpoint

The frontend already loads a single analytics payload per swimmer/event. Extending `PublicService.event_analytics(...)` keeps the event view coherent, avoids extra client round-trips, and makes the new chart data testable through the same API contract.

Alternative considered:
- Add a second endpoint for benchmark overlays. Rejected because it would split one page load into multiple coupled requests and duplicate event/swimmer filtering logic.

### Decision: Expose official thresholds as ordered benchmark entries for the swimmer gender and selected event

The backend should reuse `list_standards_for_event(...)` and return all applicable official thresholds with `achieved` and `gapMs` metadata. This preserves the existing "current grade" and "next grade" summary while giving the frontend a chart-ready, ordered set of official lines.

Alternative considered:
- Return only current and next official grade. Rejected because it still cannot show the full ladder or tell the child how far they are from each official level.

### Decision: Reuse public goals as both cards and chart overlays

Public goals already contain the target time and progression metadata. The backend will add `gapMs` and `isAchieved` so the frontend can use the same goal objects for gauge cards, gap summaries, and reference lines on the growth chart without a second goal-specific data model.

Alternative considered:
- Create a dedicated `goalBenchmarkLines` payload. Rejected because it duplicates information already present on public goals and increases contract surface area unnecessarily.

### Decision: Replace the delta-bar chart with a time-based growth chart

The public requirement is a "growth curve", not a first-attempt delta histogram. The chart should therefore plot actual times over time, highlight PB points/envelope, and place benchmark lines on the same Y-axis so children can see both trend and distance-to-target in one glance.

Alternative considered:
- Keep delta bars and add more reference lines. Rejected because official thresholds and goal targets are actual times, so mapping them onto first-result deltas is less intuitive and makes "remaining seconds" harder to reason about.

### Decision: Keep mobile readability through stacked summary panels and a wrapped benchmark legend

The overlay-rich chart needs supporting context, but phone-sized screens cannot sustain a wide dashboard layout. The page will therefore keep the chart full width, move gap summaries into stacked cards/list rows, and render the benchmark legend as wrapping chips rather than horizontal tables.

## Risks / Trade-offs

- `[More benchmark lines can clutter the chart]` -> Use clear source-specific colors, lightweight labels, and keep summary details in a separate gap panel rather than forcing all text into the plot area.
- `[Public analytics contract grows]` -> Keep additions additive, typed, and derived from existing repository data so old consumers remain easy to update.
- `[Switching chart semantics may confuse existing expectations]` -> Preserve PB highlighting and current-best summaries so the new view still communicates improvement, now with more directly useful units.
- `[Mobile pages may overflow with long labels]` -> Use concise legend labels, wrapped chip layouts, and regression tests/browser verification on narrow viewports.

## Migration Plan

1. Extend backend analytics payloads and backend tests first so the new frontend contract is stable.
2. Update frontend types and chart/summary components to consume the richer payload.
3. Verify lint, tests, and production build for the frontend plus pytest/ruff for the backend.
4. Smoke-test the public analytics page on desktop and mobile-sized viewports before archiving.

## Open Questions

- None. The requirement is specific enough to implement with the existing official-grade and goal data models.
