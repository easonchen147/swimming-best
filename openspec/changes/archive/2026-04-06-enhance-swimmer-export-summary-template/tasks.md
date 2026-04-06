## 1. Summary Export Data

- [x] 1.1 Add backend support for swimmer summary export data, reusing existing PB, goal, grade, and trend calculations where possible.
- [x] 1.2 Add backend tests covering summary export highlights, milestone data, and grade integration while preserving existing CSV export behavior.

## 2. Summary Export Frontend

- [x] 2.1 Add an admin-facing swimmer summary export page/template that presents standout performances, grade level, milestone status, and recent progress in a shareable layout.
- [x] 2.2 Wire the new summary export entry into existing admin export helpers without removing the raw CSV routes.

## 3. Verification And Archive

- [x] 3.1 Run frontend lint, frontend tests, frontend build, backend tests, backend lint, and any targeted browser verification for the summary export template.
- [x] 3.2 Sync finalized summary export behavior into the main OpenSpec specs and archive the change.
