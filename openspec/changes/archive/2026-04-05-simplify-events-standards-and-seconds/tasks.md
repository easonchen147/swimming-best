## 1. Event And Standard Model

- [x] 1.1 Seed built-in national-standard events from the checked-in official baseline resource and align display names to Chinese long-course/short-course naming
- [x] 1.2 Remove `effortType` from the admin event workflow and collapse event uniqueness to pool length + distance + stroke with fixed 25m/50m pool options
- [x] 1.3 Hide custom standards from primary admin navigation and default public/admin benchmark flows to the built-in official standard

## 2. Seconds-Based User Contract

- [x] 2.1 Switch user-facing performance and goal entry/display flows to seconds-based values while keeping migration compatibility behind the backend service layer
- [x] 2.2 Update import/export and time-input helpers so operators work only in seconds/shorthand rather than raw milliseconds
- [x] 2.3 Harden frontend API response parsing so empty or non-JSON error responses surface cleanly instead of crashing parse logic

## 3. Frontend Workflow Adjustments

- [x] 3.1 Update admin dashboard quick actions to host quick record and goal creation entry points, removing the top-header quick-record button
- [x] 3.2 Update event, record, goal, compare, and public analytics pages to use Chinese project names and clearly distinguish short-course versus long-course selections
- [x] 3.3 Ensure all touched selectors and lists no longer expose standards management as a default workflow

## 4. Verification And Archive

- [x] 4.1 Add or update backend and frontend tests for built-in events, seconds-based payloads, dashboard actions, and project naming
- [x] 4.2 Run frontend lint/test/build, Playwright on port 3000, backend pytest, and backend ruff; fix any regressions
- [x] 4.3 Sync the approved spec changes back into `openspec/specs`, archive the change, and commit the completed work
