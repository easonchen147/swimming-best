## Context

The current codebase still mixes two conceptual models. Users think in standard swimming events and seconds-based results, but the implementation exposes custom benchmark maintenance, raw millisecond fields, English event labels, and an `effortType` event dimension that belongs to result context rather than event identity. This causes friction across admin entry flows, confusing public labels, and fragile assumptions in the frontend.

The change touches backend storage adapters, repository/service validation, import/export, official baseline usage, admin navigation, and multiple public/admin pages. It also needs to preserve current data as much as possible while changing the user-facing contract. The authoritative business reference for the built-in national event catalog is the checked-in pair of source images at `docs/男子达标.jpeg` and `docs/女子达标.jpeg`; the existing JSON baseline remains the implementation-friendly projection of that source.

## Goals / Non-Goals

**Goals:**
- Make all user-facing result, goal, and standard interactions seconds-based.
- Treat built-in national-standard swimming events as the default event catalog, while still allowing custom events when needed.
- Remove `effortType` from the event-definition workflow and from event identity decisions.
- Hide manual standards management from normal admin navigation and rely on the built-in official standard by default.
- Improve admin dashboard quick actions and harden frontend API error parsing.

**Non-Goals:**
- Remove every legacy backend route or database column in one pass if compatibility shims are safer.
- Replace the checked-in national standard resource with a new external dependency.
- Rebuild the entire event or goal UI beyond what is needed for the new model.

## Decisions

### Decision: Use seconds as the user-facing contract while keeping migration compatibility in backend persistence

Administrators and public pages should enter, read, and compare seconds (`35.56`) rather than raw milliseconds. To keep this change deliverable without a risky full historical rewrite, repository-level persistence can remain compatibility-aware during migration, while the visible admin/public flows are normalized to seconds everywhere.

Alternative considered:
- Fully rewrite all database columns from integer milliseconds to floating-point seconds in one migration. Rejected for this pass because it increases migration risk across performances, goals, standards, imports, exports, and tests all at once.

### Decision: Seed built-in event definitions from the official national standard resource

The checked-in official swimming standard JSON already defines the canonical set of pool-length, distance, and stroke combinations, and it is already aligned to the source images at `docs/男子达标.jpeg` and `docs/女子达标.jpeg`. The backend should seed those events into the local event catalog so selectors, goals, and analytics can use stable event IDs while still permitting custom events. These event definitions are gender-neutral; gender only participates when matching official benchmark thresholds.

Alternative considered:
- Build a virtual event catalog in memory only. Rejected because too many existing flows assume database-backed event IDs.

### Decision: Collapse event identity to pool length + distance + stroke

`effortType` belongs to result context (`training`, `test`, `competition`) and not to the event catalog. Event creation and uniqueness should therefore be based on pool length, distance, and stroke only, with pool length restricted to 25m and 50m options.

Alternative considered:
- Keep `effortType` internally and simply hide it in the UI. Rejected because it preserves duplicate-event ambiguity and keeps the wrong domain model alive.

### Decision: Keep custom standards as legacy-compatible internals but remove them from the primary workflow

The product direction is clear: the built-in national standard is the default benchmark source. The admin standards page and menu entry should therefore disappear from the primary experience, while legacy endpoints/tables may remain temporarily for compatibility until a later cleanup.

Alternative considered:
- Hard-delete the standards subsystem in this change. Rejected because it adds migration and regression risk without improving the user-facing outcome immediately.

### Decision: Fix API client parsing by reading response text once and decoding conditionally

Frontend fetch helpers should not assume that every non-204 response contains valid JSON. Reading raw text first allows the client to surface server errors, empty bodies, and proxy/HTML failures more safely.

## Risks / Trade-offs

- `[Seconds contract drifts from millisecond persistence internals]` -> Centralize conversion in visible admin/public flows and import/export helpers, and keep tests focused on what operators and visitors actually use.
- `[Built-in event seeding collides with existing custom events]` -> Normalize uniqueness to pool length + distance + stroke and reuse or reconcile existing matching rows during seeding.
- `[Hiding standards UI leaves orphan routes]` -> Remove navigation entry and public reliance first; keep compatibility routes only as a non-primary path.
- `[Event model migration breaks old records/goals]` -> Run migrations at startup and preserve existing event IDs where possible instead of recreating everything blindly.

## Migration Plan

1. Add/adjust event seeding and event-model migration before loading admin/public flows.
2. Switch user-facing admin/public flows and import/export helpers to seconds while preserving compatibility-aware persistence behind the scenes.
3. Update frontend types and forms to consume/send seconds-only values and Chinese event labels.
4. Hide standards management entry, adjust dashboard quick actions, and verify all primary routes.
5. Run frontend lint/test/build, Playwright on port 3000, and backend pytest/ruff before archive.

## Open Questions

- None. The remaining work is implementation and migration, not product clarification.
