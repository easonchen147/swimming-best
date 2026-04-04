## 1. Dashboard Polish

- [x] 1.1 Refine the admin dashboard quick-actions area so quick record remains readable, shows its shortcut inside the quick-actions block, and the header no longer shows a separate shortcut hint
- [x] 1.2 Restyle the admin header public-page action as a full button and replace the flat management guidance cards with a flowchart-style process view

## 2. Shared Picker Controls

- [x] 2.1 Introduce shared picker-style controls for full dates and year-only selection that align visually with the current design system
- [x] 2.2 Replace swimmer birth-year entry and record-date inputs with the new picker controls

## 3. Shared Select And Runtime

- [x] 3.1 Upgrade the shared select and picker visuals to align with the rest of the application surfaces
- [x] 3.2 Switch Linux-facing backend startup paths, scripts, and docs from Waitress to Gunicorn while preserving a workable local fallback when needed

## 4. Verification And Archive

- [x] 4.1 Add or update frontend/backend tests covering dashboard affordances, picker behavior, and backend runtime expectations
- [x] 4.2 Run frontend lint/test/build, backend pytest/ruff, and affected browser tests; fix regressions
- [x] 4.3 Sync the approved spec changes back into `openspec/specs`, archive the change, and finish with a clean working tree
