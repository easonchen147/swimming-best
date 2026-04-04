# OpenSpec Grade System Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate and finish the active OpenSpec changes, implement official grade baseline, custom benchmark standards, and CSV import/export, then pass review, full verification, and archive the completed change set.

**Architecture:** Work in four layers: first eliminate OpenSpec drift and lock the scope boundaries, then land `official-swimming-grade-baseline` as the foundation for swimmer `gender` and read-only official grade evaluation, then build `myswimio-features` in two slices (custom standards and CSV import/export), and finally run review and archive work with the verified implementation as the source of truth.

**Tech Stack:** Flask, SQLite, Python 3.12, pytest, Next.js App Router, React 19, TypeScript, Vitest, Tailwind CSS 4, OpenSpec markdown artifacts.

---

### Task 1: Validate Active OpenSpec Changes And Remaining Drift

**Files:**
- Modify: `README.md`
- Modify: `openspec/changes/official-swimming-grade-baseline/*`
- Modify: `openspec/changes/myswimio-features/*`
- Review: `openspec/changes/swimming-public-ui-refactor/*`
- Review: `openspec/specs/*.md`
- Review: `backend/swimming_best/public_routes.py`
- Review: `backend/tests/test_public_api.py`

- [ ] **Step 1: Re-read active change docs and detect mismatch list**

Run: `rg -n "compare|officialGrade|gender|time_standards|import_export" backend frontend openspec README.md -S`
Expected: identify compare residue, missing official grade fields, and active change boundaries.

- [ ] **Step 2: Update remaining proposal/spec wording before implementation**

Focus:
- keep `official-swimming-grade-baseline` responsible for `gender` and read-only official grade
- keep `myswimio-features` responsible for custom standards and import/export
- note `swimming-public-ui-refactor` as archive-ready

- [ ] **Step 3: Record implementation order**

Order:
1. official baseline foundation
2. custom standards
3. import/export
4. review + verify + archive

### Task 2: Add Failing Backend Tests For Official Grade Baseline

**Files:**
- Modify: `backend/tests/conftest.py`
- Modify: `backend/tests/test_admin_api.py`
- Modify: `backend/tests/test_public_api.py`
- Create: `backend/tests/test_official_grade_baseline.py`

- [ ] **Step 1: Write failing tests for swimmer gender persistence**

Cases:
- create swimmer with `gender="male"` persists value
- update swimmer to `gender="female"` persists value
- legacy DB without `gender` gets backfilled to `unknown`

- [ ] **Step 2: Write failing tests for official grade baseline loading and matching**

Cases:
- supported event + gender returns expected official grade
- supported event + gender returns next official grade gap
- `gender="unknown"` returns `officialGradeStatus="missing_gender"`
- unsupported event returns `officialGradeStatus="unavailable_for_event"`

- [ ] **Step 3: Write failing analytics integration tests**

Case:
- `GET /api/public/swimmers/:slug/events/:eventId/analytics` returns `officialGrade`, `nextOfficialGrade`, and `officialGradeStatus`

- [ ] **Step 4: Run targeted backend tests to verify RED**

Run: `cd backend && poetry run python -m pytest tests/test_official_grade_baseline.py tests/test_public_api.py -q`
Expected: FAIL due to missing `gender` column, missing official resource loader, and missing analytics fields.

### Task 3: Implement Official Grade Baseline Backend

**Files:**
- Modify: `backend/swimming_best/db.py`
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Create: `backend/swimming_best/official_grade_baseline.py`
- Create: `backend/swimming_best/resources/official_swimming_grade_standards.cn-2025.json`

- [ ] **Step 1: Add swimmer `gender` schema migration**

Implement:
- add `gender TEXT NOT NULL DEFAULT 'unknown'` to fresh schema
- add startup migration for older databases missing the column

- [ ] **Step 2: Thread `gender` through repository payloads**

Implement:
- `create_swimmer()`
- `update_swimmer()`
- `_list_swimmers()` select list
- `_row_to_swimmer()`

- [ ] **Step 3: Add read-only official baseline loader**

Implement:
- JSON resource loading
- cached access helper
- event-to-standard matching by `poolLengthM + distanceM + stroke + gender`

- [ ] **Step 4: Add official grade evaluation logic**

Implement:
- highest achieved tier
- next target tier
- status handling for `missing_gender`, `unavailable_for_event`, `no_valid_performance`

- [ ] **Step 5: Extend public analytics response**

Implement:
- inject `officialGrade`
- inject `nextOfficialGrade`
- inject `officialGradeStatus`

- [ ] **Step 6: Run targeted backend tests to verify GREEN**

Run: `cd backend && poetry run python -m pytest tests/test_official_grade_baseline.py tests/test_public_api.py tests/test_admin_api.py -q`
Expected: PASS

### Task 4: Add Failing Frontend Tests For Gender And Official Grade Display

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api/admin.test.ts`
- Modify: `frontend/src/lib/api/public.test.ts`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/swimmers/[slug]/page.tsx`
- Modify: `frontend/src/app/swimmers/[slug]/events/[eventId]/page.tsx`
- Create: `frontend/src/components/shared/official-grade-badge.tsx`
- Create: `frontend/src/components/shared/official-grade-status.tsx`
- Create: `frontend/src/components/shared/official-grade-badge.test.tsx`

- [ ] **Step 1: Write failing type and API contract tests**

Cases:
- admin swimmer payload includes `gender`
- public analytics payload includes official grade fields

- [ ] **Step 2: Write failing UI tests**

Cases:
- admin swimmer form renders gender select
- swimmer detail page renders official grade when available
- swimmer detail page renders fallback hint when gender is unknown

- [ ] **Step 3: Run targeted frontend tests to verify RED**

Run: `npm --prefix frontend run test -- --runInBand`
Expected: FAIL in new API/type/UI assertions.

### Task 5: Implement Official Grade Frontend

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/swimmers/[slug]/page.tsx`
- Modify: `frontend/src/app/swimmers/[slug]/events/[eventId]/page.tsx`
- Create: `frontend/src/components/shared/official-grade-badge.tsx`
- Create: `frontend/src/components/shared/official-grade-status.tsx`

- [ ] **Step 1: Add gender and official grade TypeScript types**

Implement:
- `AdminSwimmer.gender`
- `PublicSwimmerDetail.gender` if needed
- `OfficialGrade`, `NextOfficialGrade`, `OfficialGradeStatus`

- [ ] **Step 2: Add admin swimmer gender form control**

Implement:
- select with `male/female/unknown`
- edit flow preserves existing value

- [ ] **Step 3: Add official grade display components**

Implement:
- badge for current grade
- fallback notice for missing gender / unavailable event
- next grade gap text

- [ ] **Step 4: Render official grade info in public pages**

Implement:
- swimmer detail page
- event detail page

- [ ] **Step 5: Run targeted frontend tests to verify GREEN**

Run: `npm --prefix frontend run test`
Expected: PASS

### Task 6: Add Failing Backend Tests For Custom Standards

**Files:**
- Create: `backend/tests/test_custom_time_standards.py`
- Modify: `backend/tests/test_public_api.py`
- Modify: `backend/tests/test_admin_api.py`

- [ ] **Step 1: Write failing CRUD tests for custom standard groups and entries**

Cases:
- create/list/update/delete standard group
- create/list/update/delete entry
- entry gender accepts `male/female/all`

- [ ] **Step 2: Write failing analytics tests for custom benchmark fields**

Cases:
- `customStandards`, `nextCustomStandard`, `benchmarkLines` returned for supported event

- [ ] **Step 3: Run targeted backend tests to verify RED**

Run: `cd backend && poetry run python -m pytest tests/test_custom_time_standards.py tests/test_public_api.py tests/test_admin_api.py -q`
Expected: FAIL because schema, routes, and services are missing.

### Task 7: Implement Custom Standards Backend And Frontend

**Files:**
- Modify: `backend/swimming_best/db.py`
- Modify: `backend/swimming_best/repository.py`
- Modify: `backend/swimming_best/services.py`
- Modify: `backend/swimming_best/admin_routes.py`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/lib/api/public.ts`
- Create: `frontend/src/app/admin/standards/page.tsx`
- Create: `frontend/src/components/shared/standard-badge.tsx`
- Create: `frontend/src/components/shared/standard-progress.tsx`

- [ ] **Step 1: Add custom standards schema and repository logic**

- [ ] **Step 2: Add admin routes and service wiring**

- [ ] **Step 3: Extend analytics with custom benchmark payload**

- [ ] **Step 4: Add admin standards page and public benchmark presentation**

- [ ] **Step 5: Run backend and frontend targeted tests**

Run backend: `cd backend && poetry run python -m pytest tests/test_custom_time_standards.py -q`
Run frontend: `npm --prefix frontend run test`
Expected: PASS

### Task 8: Add Failing Tests For CSV Import/Export

**Files:**
- Create: `backend/tests/test_import_export.py`
- Modify: `frontend/src/lib/api/admin.test.ts`
- Create: `frontend/src/app/admin/import/page.tsx`
- Create: `frontend/src/components/shared/import-wizard.test.tsx`

- [ ] **Step 1: Write failing backend tests for parse/preview/confirm/export**

Cases:
- template download
- preview returns valid and error rows
- confirm creates contexts and performances transactionally
- swimmer export CSV
- team export CSV

- [ ] **Step 2: Write failing frontend tests for import wizard flow**

Cases:
- upload -> preview -> confirm
- export button wiring

- [ ] **Step 3: Run targeted tests to verify RED**

Run backend: `cd backend && poetry run python -m pytest tests/test_import_export.py -q`
Run frontend: `npm --prefix frontend run test`
Expected: FAIL because import/export paths and UI do not exist.

### Task 9: Implement CSV Import/Export

**Files:**
- Create: `backend/swimming_best/import_export.py`
- Modify: `backend/swimming_best/admin_routes.py`
- Modify: `backend/swimming_best/repository.py`
- Modify: `frontend/src/lib/api/admin.ts`
- Create: `frontend/src/app/admin/import/page.tsx`
- Create: `frontend/src/components/shared/import-wizard.tsx`
- Modify: `frontend/src/app/admin/swimmers/page.tsx`
- Modify: `frontend/src/app/admin/teams/page.tsx`

- [ ] **Step 1: Implement CSV parsing, validation, and transactional import**

- [ ] **Step 2: Implement CSV template and export endpoints**

- [ ] **Step 3: Implement import wizard and export buttons**

- [ ] **Step 4: Run targeted tests to verify GREEN**

Run backend: `cd backend && poetry run python -m pytest tests/test_import_export.py -q`
Run frontend: `npm --prefix frontend run test`
Expected: PASS

### Task 10: Review, Verify, And Archive

**Files:**
- Modify: `openspec/changes/*`
- Modify: `openspec/specs/*`
- Modify: `README.md`

- [ ] **Step 1: Run code review after implementation batch**

Requirement:
- review `official-swimming-grade-baseline`
- review `myswimio-features`
- confirm no Important/Critical findings remain

- [ ] **Step 2: Run full verification**

Run: `npm run check`
Expected: PASS

- [ ] **Step 3: Run additional targeted verification**

Run:
- `cd backend && poetry run python -m pytest tests/test_official_grade_baseline.py tests/test_custom_time_standards.py tests/test_import_export.py -q`
- `npm --prefix frontend run build`
Expected: PASS

- [ ] **Step 4: Align OpenSpec baseline and archive completed changes**

Actions:
- archive `swimming-public-ui-refactor`
- archive `official-swimming-grade-baseline`
- archive `myswimio-features` only after implementation and verification are fully green
- update affected baseline specs in `openspec/specs/`

- [ ] **Step 5: Re-run archive-related verification**

Run: `rg -n "TBD|official-swimming-grade-baseline|myswimio-features|swimming-public-ui-refactor" openspec -S`
Expected: only intentional archive references remain.
