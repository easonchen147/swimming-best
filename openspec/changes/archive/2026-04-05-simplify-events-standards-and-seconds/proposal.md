## Why

The current product still reflects earlier implementation shortcuts: times are carried through the admin and frontend flows as raw milliseconds, events depend on an `effortType` dimension that users do not actually think in, and standard management is exposed as if operators must maintain benchmark ladders manually even though the desired source of truth is the built-in national standard. These mismatches create unnecessary operator friction, confusing project labels, and fragile frontend error handling.

## What Changes

- Switch user-facing goal, result, import/export, and standard interactions to seconds-based values instead of raw milliseconds, while keeping parsing and display consistent everywhere.
- Make the system default to built-in national-standard swimming events and official grade guidance, derived from the checked-in standard resource and aligned to `docs/男子达标.jpeg` plus `docs/女子达标.jpeg`, with clear long-course/short-course distinctions and Chinese display names. Event definitions remain gender-neutral; only benchmark matching uses event + swimmer gender.
- Remove `effortType` from the admin event-definition workflow and treat event identity as pool length + distance + stroke, with pool length restricted to 25m and 50m.
- Hide custom standard management from the primary admin navigation and stop treating manual benchmark maintenance as a required workflow.
- Move quick-record entry from the admin header into dashboard quick actions, add a quick action for creating goals, and keep keyboard shortcuts available.
- Harden frontend API error parsing so non-JSON or empty responses do not crash the client with opaque parse failures.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `structured-events`: event identity, default catalog seeding, fixed pool-length options, and Chinese display naming change.
- `performance-recording`: admin result entry and CSV handling use seconds-based values in the user-facing contract.
- `progress-goals`: goal creation and public/admin goal views use seconds-based values in the user-facing contract.
- `smart-time-input`: replace the dual milliseconds/seconds workflow with a seconds-first entry model and shorthand parsing.
- `official-grade-baseline`: built-in national standards become the default benchmark source tied to swimmer gender and event.
- `time-standards`: custom standard maintenance is no longer part of the primary admin workflow and should not be surfaced as a default management entry point.
- `admin-dashboard-navigation`: dashboard quick actions are reorganized around quick recording and goal creation, with no top-header quick-record button.
- `public-performance-portal`: public-facing event labels and benchmark displays must align with the built-in national event catalog and Chinese naming.

## Impact

- Affects backend event/goal/performance services, repository validation, import/export handling, and event seeding/migration logic.
- Affects frontend admin event/records/goals/dashboard flows, event labels across public pages, navigation structure, and API client error handling.
- Changes the user-facing time-entry and display contract to seconds while keeping compatibility-aware backend persistence during migration.
