## Context

This is a greenfield repository with an OpenSpec skeleton and no application code. The system needs to serve two very different but related use cases: an admin-operated management experience and a public read-only showcase. The data model must support both direct single-entry recording and richer session-style recording for training, tests, and competitions. The UI must be explicitly responsive because public consumption will happen heavily on mobile phones while admin entry is still most efficient on desktop.

## Goals / Non-Goals

**Goals:**
- Build a full MVP spanning backend, frontend, persistence, analytics, tests, and documentation.
- Keep the recording model consistent enough that PB, trend, goal, and compare analytics stay trustworthy.
- Provide a polished public experience and an efficient admin workflow across desktop and mobile layouts.
- Keep deployment and local development simple by using SQLite and fixed config-based admin credentials.

**Non-Goals:**
- Parent self-service accounts or public registration
- Payment, notification, scheduling, or training-plan management
- Cross-event ranking logic
- Predictive coaching recommendations or AI-generated advice

## Decisions

### Decision: Split frontend and backend, keep a single frontend app

Use `frontend/` for Next.js and `backend/` for the backend service. The backend owns persistence, auth, and analytics. The frontend owns rendering, routing, forms, and share views. A single Next.js app will contain both admin and public route groups so design tokens, chart components, and responsive primitives are shared instead of duplicated.

Alternative considered:
- A monolithic server-rendered HTML app would reduce moving parts but would make the UI/UX targets and modern design stack much harder to achieve.
- Separate public and admin frontends would increase duplication for little MVP benefit.

### Decision: Normalize recording around contexts plus performances

Every result belongs to a `record_context`, even quick entry. Quick entry creates a lightweight single-entry context automatically. This keeps the data model uniform and preserves the semantic source of the result for filtering, notes, and later expansion.

Alternative considered:
- Separate single-entry and batch-entry tables were rejected because they would duplicate analytics logic and complicate queries.

### Decision: Use structure-first event identity

Event identity will be the tuple of pool length, distance, stroke, and effort type. Display names are derived from that tuple and can be overridden for polish. Tags and notes carry flexible metadata but do not influence PB bucketing.

Alternative considered:
- Free-text event names were rejected because they would create irreconcilable duplicates and break compare accuracy.

### Decision: Keep auth simple with hashed fixed admins and cookie sessions

Admins live in config. Passwords are stored as hashes, not plaintext. On login, the backend issues an `HttpOnly` session cookie and admin routes use middleware. No user table is needed in SQLite for MVP.

Alternative considered:
- JWTs were rejected because they add unnecessary token management for a single-admin-style MVP.

### Decision: Compute analytics server-side

PB state, trend payloads, goal progress, and compare series are computed in backend services and returned as ready-to-render API payloads. The frontend should not have to rebuild business logic from raw rows.

Alternative considered:
- Client-side aggregation was rejected because it would duplicate logic, increase payload size, and risk inconsistent behavior.

### Decision: Treat responsive design as a first-class architecture concern

Shared layout primitives will support mobile-first rendering. Admin tables will collapse into cards or stacked sections at small widths. Public charts will support fewer visible ticks, touch-friendly spacing, and summary-first card layouts. Desktop and mobile screenshots will both be part of the final verification.

Alternative considered:
- Desktop-first pages patched later for mobile were rejected because the primary consumption path is mobile and retrofitting would cause rework.

## Risks / Trade-offs

- `[SQLite write contention]` → Keep transactions short, enable WAL, and scope MVP to low-concurrency admin editing.
- `[Wide functional scope]` → Sequence work into scaffold, backend, analytics, admin UI, public UI, then verification milestones.
- `[Responsive charts become cramped on phones]` → Prefer summary cards, segmented controls, and simplified axis labeling on mobile.
- `[shadcn/ui and Tailwind ecosystem drift]` → Verify exact stable versions before scaffolding and keep dependency choices conservative.
- `[Public privacy leaks]` → Build dedicated public DTOs and centralize display-name resolution in backend services.
