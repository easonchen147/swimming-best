# Managed Team Entities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the incorrect free-text swimmer team model with managed team entities across OpenSpec, backend, frontend, tests, verification, and release.

**Architecture:** Add a first-class `teams` table and move swimmers to `team_id` foreign-key ownership, then align all admin/public payloads on `teamId + team` instead of `teamName`. Update the frontend so team management and swimmer assignment use the same managed-team contract end-to-end.

**Tech Stack:** Python 3.12, Flask, SQLite, pytest, Next.js 16, React 19, Vitest, ESLint, OpenSpec

---

### Task 1: Backend Red Tests For Managed Teams

**Files:**
- Modify: `backend/tests/conftest.py`
- Modify: `backend/tests/test_admin_api.py`
- Modify: `backend/tests/test_public_api.py`

- [ ] **Step 1: Write failing admin API tests**

Add tests for:
- team create/list/update
- swimmer create/update by `teamId`
- admin swimmer filter by `teamId`
- performance payload nested swimmer team object

- [ ] **Step 2: Write failing public API tests**

Add tests for:
- public list payload contains `team`
- public filter uses `teamId`
- detail/analytics/compare payloads carry managed team data

- [ ] **Step 3: Run backend tests to verify RED**

Run: `cd backend && python -m pytest tests/test_admin_api.py tests/test_public_api.py -q`
Expected: FAIL because team APIs, schema, and payload contracts do not exist yet

### Task 2: Backend Schema, Migration, Repository, And Routes

**Files:**
- Modify: `backend/swimming_best/db.py`
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Modify: `backend/swimming_best/admin_routes.py`
- Modify: `backend/swimming_best/public_routes.py`

- [ ] **Step 1: Implement `teams` schema and legacy migration**

Create `teams` table, rebuild `swimmers` to use `team_id`, and migrate legacy
`team_name` values into managed team entities.

- [ ] **Step 2: Implement repository/service support**

Add team CRUD/list methods, swimmer join queries, `teamId` filters, and nested
team payload conversion helpers.

- [ ] **Step 3: Implement admin/public routes**

Add `/api/admin/teams` GET/POST and `/api/admin/teams/<team_id>` PATCH, then
switch swimmer list/create/update and public list payloads to the new contract.

- [ ] **Step 4: Run backend tests to verify GREEN**

Run: `cd backend && python -m pytest tests/test_admin_api.py tests/test_public_api.py -q`
Expected: PASS

### Task 3: Frontend Red Tests And Contract Alignment

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/lib/swimmer-label.ts`
- Modify/Create: `frontend/src/**/*.test.tsx`

- [ ] **Step 1: Write failing frontend tests**

Cover:
- admin team list/create/update interactions
- swimmer form team selection
- public roster/detail rendering from `team`

- [ ] **Step 2: Run targeted frontend tests to verify RED**

Run: `npm --prefix frontend run test -- --runInBand`
Expected: FAIL because types/components still expect `teamName`

### Task 4: Frontend Team Management And Display Refactor

**Files:**
- Modify: `frontend/src/app/admin/page.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Create/Modify: `frontend/src/app/admin/teams/page.tsx`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/swimmers/**/page.tsx`
- Modify: `frontend/src/app/compare/page.tsx`
- Modify: `frontend/src/components/layout/admin-shell.tsx`

- [ ] **Step 1: Switch shared types and API clients to managed teams**

Introduce `TeamSummary`, replace `teamName` fields, and add admin team API calls.

- [ ] **Step 2: Build admin team management and swimmer team selection**

Add a page for team maintenance and convert swimmer free-text input into a team
selector populated from managed teams.

- [ ] **Step 3: Update dashboard and public/admin views**

Make filters, labels, detail cards, compare views, and share pages render from
`team.name` and filter by `teamId`.

- [ ] **Step 4: Run frontend checks to verify GREEN**

Run:
- `npm run frontend:test`
- `npm run frontend:lint`
- `npm run frontend:build`

Expected: PASS

### Task 5: Review, Verification, Archive, And Commit

**Files:**
- Modify: `openspec/changes/rework-managed-team-entities/tasks.md`
- Modify: `openspec/specs/**/*.md` (via archive sync if needed)

- [ ] **Step 1: Mark completed OpenSpec tasks**

Update the new change task checklist to reflect finished implementation work.

- [ ] **Step 2: Perform final code review and fix findings**

Review the full diff for business-model correctness, regressions, and missing tests.

- [ ] **Step 3: Run full verification**

Run:
- `npm run backend:test`
- `npm run backend:lint`
- `npm run frontend:test`
- `npm run frontend:lint`
- `npm run frontend:build`
- `openspec status --change "rework-managed-team-entities" --json`

- [ ] **Step 4: Verify change, archive, and commit**

Run OpenSpec verification, archive the change only after all checks pass, then
create a git commit for the verified final state.
