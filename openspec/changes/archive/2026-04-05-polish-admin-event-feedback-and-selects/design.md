## Context

The current admin UI is already close to the desired model, but several last-mile issues make it feel unreliable. Event creation can silently reuse an existing built-in event and let the frontend append a duplicate object, which then surfaces as a duplicate React key warning. The quick-actions area also lacks enough visible affordance for the quick-record shortcut, swimmer birth year is still a free text field, and the shared select styling still looks noticeably more native and less intentional than the rest of the interface.

This change is mostly frontend-facing. The most important fix is that the admin
events workflow should detect and communicate the already-exists outcome
explicitly instead of letting duplicate event state leak into the page.

## Goals / Non-Goals

**Goals:**
- Return an explicit duplicate-event error from the backend and show that feedback cleanly in the admin events page.
- Prevent duplicate event objects from appearing in admin state even if the backend returns an existing event unexpectedly.
- Make quick actions visually self-describing, including the keyboard shortcut for quick record.
- Replace swimmer birth-year free text with a constrained year selector.
- Upgrade all shared selects so they visually match the rest of the product.

**Non-Goals:**
- Rework the event model again or change the national event catalog.
- Replace all form primitives with a brand-new component library.
- Touch unrelated admin/public pages unless they consume the shared select control.

## Decisions

### Decision: Duplicate events should surface an explicit already-exists outcome in the admin workflow

The admin events page should detect an existing pool-length/distance/stroke
combination, surface a readable "already exists" message, and keep local state
unchanged. The page should also deduplicate any fetched event list before
rendering so legacy duplicate rows cannot trigger React key collisions.

Alternative considered:
- Change backend create semantics again. Rejected for this pass because the user
  pain is in the admin page workflow and local duplicate state, which can be
  fixed with lower risk on the frontend.

### Decision: Quick-record affordance belongs inside the quick-actions surface

The dashboard should move the shortcut hint (`Ctrl / Cmd + K`) into the quick-record action itself or an adjacent quick-actions description, so the meaning of the action is visible where the action lives.

Alternative considered:
- Keep the shortcut hint in the header. Rejected because the user already called out that it feels disconnected from the action itself.

### Decision: Birth year should use a constrained year selector

A dropdown-style year picker is sufficient here because the field is a single year, not a full date. Constraining the list reduces malformed input and speeds up operator use on desktop and mobile.

Alternative considered:
- Use a numeric input with validation. Rejected because the current issue is usability rather than raw validation capability.

### Decision: Improve the shared native-select wrapper instead of replacing every select with a new primitive

The repo already uses a shared `Select` wrapper. Upgrading that wrapper's visual styling and affordances is the lowest-risk way to improve every dropdown consistently.

Alternative considered:
- Migrate all selects to a Radix custom select. Rejected for this pass because it would increase scope and testing surface substantially.

## Risks / Trade-offs

- `[Duplicate-event validation changes existing client expectations]` -> Update admin event creation tests and page logic to expect and surface explicit duplicate feedback.
- `[Large year range makes the year picker cumbersome]` -> Generate a reasonable bounded range centered around likely swimmer ages.
- `[Shared select restyling affects many pages at once]` -> Keep the API identical and validate affected admin/public routes through lint, build, Vitest, and existing Playwright flows.

## Migration Plan

1. Adjust admin events page state handling and duplicate feedback.
2. Improve shared select styling and birth-year selection.
3. Refine dashboard quick-actions copy and shortcut affordances.
4. Run frontend lint/test/build and backend pytest/ruff before archive.

## Open Questions

- None. The remaining work is implementation detail and regression coverage.
