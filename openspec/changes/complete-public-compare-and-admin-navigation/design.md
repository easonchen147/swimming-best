## Context

The backend already provides `/api/public/compare`, but the frontend currently lacks a real `/compare` page implementation. The admin dashboard also renders "quick action" buttons that do not link to real pages, which creates a misleading operator experience. Browser verification on mobile confirmed that pages render without horizontal overflow, but Recharts still warns about negative or missing dimensions during initial render on chart-heavy pages.

## Goals / Non-Goals

**Goals:**
- Ship a real public compare page using the current compare API.
- Turn dashboard shortcut actions into real navigation entry points.
- Remove chart sizing warnings on key pages by ensuring stable container dimensions and layout rules.
- Preserve the existing visual language while improving functional clarity on desktop and mobile.

**Non-Goals:**
- Rework the compare analytics contract beyond what is required for frontend consumption.
- Add cross-event compare or new compare dimensions beyond the same-event compare flow.
- Redesign the entire admin dashboard information architecture.

## Decisions

### Decision: Use the existing compare API as the primary data source

The frontend compare page should consume `/api/public/compare` directly rather than reassembling compare data from multiple endpoints. This keeps the compare behavior aligned with backend analytics logic and minimizes frontend duplication.

### Decision: Make quick actions explicit links, not imperative client-side logic

Dashboard quick actions should navigate via `Link` or route-aware buttons to existing admin pages (`records`, `import`, `swimmers`) so the entry points remain declarative, accessible, and testable.

### Decision: Stabilize chart layouts with explicit container sizing

Rather than relying on implicit parent heights, chart components should be rendered inside containers with guaranteed dimensions at all breakpoints. This reduces Recharts sizing warnings and makes mobile rendering more predictable.

## Risks / Trade-offs

- `[Compare UI assumes current payload is enough]` → verify live payload shape before finalizing page implementation and add a small adapter if needed.
- `[Chart warning fixes accidentally reduce visual density]` → keep desktop sizing generous while enforcing mobile minimum heights.
- `[Admin quick actions become stale]` → point them only at maintained routes and cover them with component tests.

