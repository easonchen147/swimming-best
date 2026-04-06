## 1. Arena Data Layer

- [x] 1.1 Add backend repository and service support for public arena race groups, using best valid public performances grouped by event and swimmer gender.
- [x] 1.2 Expose the public arena aggregate through a new public API route with optional gender, pool length, and team filters.
- [x] 1.3 Add backend tests covering arena grouping, filter behavior, and exclusion of unknown-gender swimmers.

## 2. Arena Frontend

- [x] 2.1 Add the new public arena page, update public navigation copy to “竞技场”, and keep `/compare` as a compatibility route to the new experience.
- [x] 2.2 Build the arena market board UI and detail panel using shadcn components plus Recharts heatmap-style visualization.
- [x] 2.3 Add or update frontend unit tests for arena navigation, filtering, and detail drill-down behavior.

## 3. Verification And Archive

- [x] 3.1 Run frontend lint, unit tests, production build, backend tests, and targeted Playwright verification for the arena experience.
- [x] 3.2 Sync the finalized arena behavior into the main OpenSpec specs and archive the change.
