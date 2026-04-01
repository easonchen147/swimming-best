# Swimming Performance System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready MVP for multi-swimmer swimming performance tracking with admin-managed data entry, PB analytics, goal tracking, public sharing, and responsive desktop/mobile UX.

**Architecture:** Use a split frontend/backend architecture. The Go backend owns configuration, authentication, SQLite persistence, analytics, and public/admin APIs. The Next.js frontend owns admin workflows, public views, charts, share pages, and responsive layouts while consuming the backend API through typed client helpers.

**Tech Stack:** Go 1.24.1, Gin, SQLite (modernc), bcrypt, Next.js, React, TypeScript, shadcn/ui, Tailwind CSS, Recharts, Playwright, Vitest

---

## File Map

- `backend/cmd/server/main.go`: server bootstrap and HTTP startup
- `backend/internal/config/*`: configuration loading and validation
- `backend/internal/db/*`: SQLite connection and schema migration
- `backend/internal/auth/*`: fixed-admin login and session helpers
- `backend/internal/repository/*`: swimmer, event, context, performance, goal persistence
- `backend/internal/service/*`: business logic and analytics orchestration
- `backend/internal/http/*`: admin/public routers, DTOs, middleware
- `backend/internal/analytics/*`: PB, trend, goal progress, compare calculations
- `backend/tests/*`: repository, service, and HTTP integration tests
- `frontend/package.json`: pinned stable frontend dependencies
- `frontend/src/app/(admin)/*`: admin pages
- `frontend/src/app/(public)/*`: public pages
- `frontend/src/components/*`: layout, charts, forms, share cards
- `frontend/src/lib/*`: API client, formatting, auth helpers, design tokens
- `frontend/tests/*`: component, route, and e2e coverage

### Task 1: Project Scaffolding And Repo Hygiene

**Files:**
- Create: `frontend/*`
- Create: `backend/*`
- Modify: `.gitignore`
- Create: `README.md`

- [ ] Step 1: Verify latest stable versions for Next.js, React, Tailwind, shadcn prerequisites, charting and test tooling
- [ ] Step 2: Scaffold the Next.js frontend with TypeScript, Tailwind, app router, linting, and source directory
- [ ] Step 3: Initialize the Go backend module with Gin and SQLite dependencies
- [ ] Step 4: Add repo-level scripts and a top-level README with run/test commands
- [ ] Step 5: Run `npm install`, `npm run lint`, `npm run build`, and `go test ./...` to verify the clean scaffold
- [ ] Step 6: Commit the scaffold milestone

### Task 2: Backend Foundation With Tests

**Files:**
- Create: `backend/internal/config/*.go`
- Create: `backend/internal/db/*.go`
- Create: `backend/internal/auth/*.go`
- Create: `backend/internal/http/middleware/*.go`
- Test: `backend/tests/config_test.go`
- Test: `backend/tests/auth_test.go`

- [ ] Step 1: Write failing tests for config loading, password hash validation, and protected admin middleware
- [ ] Step 2: Run the focused Go tests and confirm they fail for the expected missing behavior
- [ ] Step 3: Implement config parsing, bcrypt verification, signed session cookies, and middleware
- [ ] Step 4: Re-run the focused Go tests until they pass
- [ ] Step 5: Run the backend suite to ensure the foundation stays green
- [ ] Step 6: Commit the backend foundation milestone

### Task 3: Data Model, Repositories, And Admin APIs

**Files:**
- Create: `backend/internal/repository/*.go`
- Create: `backend/internal/service/admin_*.go`
- Create: `backend/internal/http/admin/*.go`
- Test: `backend/tests/repository_test.go`
- Test: `backend/tests/admin_api_test.go`

- [ ] Step 1: Write failing tests for swimmer CRUD, event uniqueness, quick-entry persistence, and context batch entry
- [ ] Step 2: Run the repository and HTTP tests and confirm they fail for missing storage/routes
- [ ] Step 3: Implement SQLite schema, repositories, admin services, and admin endpoints
- [ ] Step 4: Re-run focused tests until they pass
- [ ] Step 5: Run the full backend suite and confirm admin APIs are green
- [ ] Step 6: Commit the admin data milestone

### Task 4: Analytics, Goals, And Public APIs

**Files:**
- Create: `backend/internal/analytics/*.go`
- Create: `backend/internal/service/public_*.go`
- Create: `backend/internal/http/public/*.go`
- Test: `backend/tests/analytics_test.go`
- Test: `backend/tests/public_api_test.go`

- [ ] Step 1: Write failing tests for PB detection, trend payloads, goal progress, public visibility filtering, and same-event compare
- [ ] Step 2: Run the analytics/public tests and verify they fail correctly
- [ ] Step 3: Implement analytics services and public endpoints
- [ ] Step 4: Re-run focused tests until they pass
- [ ] Step 5: Run the full backend suite
- [ ] Step 6: Commit the analytics milestone

### Task 5: Frontend Design System And App Shell

**Files:**
- Create: `frontend/src/app/(admin)/*`
- Create: `frontend/src/app/(public)/*`
- Create: `frontend/src/components/layout/*`
- Create: `frontend/src/components/ui/*`
- Create: `frontend/src/lib/design/*`
- Test: `frontend/src/components/**/*.test.tsx`

- [ ] Step 1: Use the UI/UX and frontend design guidance to define the visual system, responsive breakpoints, and shared layout primitives
- [ ] Step 2: Write failing component tests for navigation, mobile sheet behavior, and public hero/stat cards
- [ ] Step 3: Implement the shared app shell, navigation, design tokens, and motion accents
- [ ] Step 4: Re-run focused frontend tests until they pass
- [ ] Step 5: Run `npm run lint` and `npm run test`
- [ ] Step 6: Commit the frontend shell milestone

### Task 6: Admin Workflows

**Files:**
- Create: `frontend/src/app/(admin)/admin/**/*.tsx`
- Create: `frontend/src/components/forms/*`
- Create: `frontend/src/lib/api/admin.ts`
- Test: `frontend/src/app/(admin)/admin/**/*.test.tsx`

- [ ] Step 1: Write failing tests for login, swimmer/event management, quick entry, and context batch entry screens
- [ ] Step 2: Run those tests and verify the missing screens/flows fail as expected
- [ ] Step 3: Implement the admin pages and forms against the backend APIs
- [ ] Step 4: Re-run focused tests until they pass
- [ ] Step 5: Run frontend test and build commands
- [ ] Step 6: Commit the admin UI milestone

### Task 7: Public Pages, Charts, Share Views, And Responsive Support

**Files:**
- Create: `frontend/src/app/(public)/**/*.tsx`
- Create: `frontend/src/components/charts/*`
- Create: `frontend/src/components/share/*`
- Create: `frontend/src/lib/api/public.ts`
- Test: `frontend/src/app/(public)/**/*.test.tsx`
- Test: `frontend/tests/e2e/*.spec.ts`

- [ ] Step 1: Write failing tests for public swimmer pages, compare page, share views, and mobile responsive behaviors
- [ ] Step 2: Run the route/component/e2e tests and confirm they fail for missing functionality
- [ ] Step 3: Implement the public pages, charts, share views, and mobile-first responsive interactions
- [ ] Step 4: Re-run focused tests until they pass
- [ ] Step 5: Run lint, unit/integration tests, and Playwright e2e
- [ ] Step 6: Commit the public UX milestone

### Task 8: Final Verification And Archive

**Files:**
- Modify: `openspec/changes/build-swimming-performance-system/tasks.md`
- Modify: `README.md`
- Modify: `openspec/specs/**/*`

- [ ] Step 1: Run the complete backend and frontend verification suite from a clean state
- [ ] Step 2: Perform manual smoke tests for desktop and mobile viewports
- [ ] Step 3: Update documentation with verified setup and test commands
- [ ] Step 4: Mark all OpenSpec tasks complete
- [ ] Step 5: Commit the final verified implementation
- [ ] Step 6: Verify the change against OpenSpec artifacts and archive it with spec sync

