## Why

Children's swimming results are often tracked in ad-hoc notes or spreadsheets, which makes it hard to see personal bests, progress over time, milestone goals, and fair same-event comparisons across multiple swimmers. A dedicated results system is needed now so parents or coaches can record data consistently, share public progress pages, and scale from one child to multiple children without losing data quality.

## What Changes

- Build a multi-swimmer swimming performance tracking MVP with fixed-admin authentication and public read-only pages.
- Add structured swimmer profiles with configurable public identity modes and public visibility controls.
- Add structured event definitions plus tag-based context and notes for training, tests, and competitions.
- Add quick single-result entry and context-based batch entry with SQLite-backed persistence.
- Add PB detection, trend data, goal tracking, milestone progress, and same-event swimmer comparisons.
- Add desktop and mobile responsive public/admin pages, share-friendly views, and modern UI styling.

## Capabilities

### New Capabilities
- `admin-authentication`: Fixed-admin login, logout, and protected management surfaces.
- `swimmer-roster`: Multi-swimmer profiles with public identity and visibility controls.
- `structured-events`: Structured swimming event catalog with stable analytics dimensions.
- `performance-recording`: Quick-entry and context-based result entry with notes, tags, and result states.
- `progress-goals`: PB, trend, goal progress, and same-event comparison analytics.
- `public-performance-portal`: Public swimmer pages, compare views, and share surfaces for allowed data.
- `responsive-ui`: Desktop and mobile responsive behavior across public and admin surfaces.

### Modified Capabilities

## Impact

- Adds a Go backend service with Gin, SQLite persistence, analytics services, and admin/public APIs.
- Adds a Next.js frontend with admin and public experiences, charts, share views, and responsive layouts.
- Introduces stable frontend dependencies and Go modules for UI, testing, and database access.
- Adds OpenSpec documentation, executable plans, automated tests, and archive-ready capability specs.

