## 1. Event Feedback

- [x] 1.1 Surface an explicit duplicate-event message in the admin events workflow instead of silently reusing the existing event
- [x] 1.2 Update the admin events page to surface duplicate feedback and avoid duplicate local list state or duplicate React keys

## 2. Quick Actions And Roster

- [x] 2.1 Refine admin dashboard quick actions so quick record clearly shows what it does and includes the keyboard shortcut in the quick-actions surface
- [x] 2.2 Replace swimmer birth-year free text with a bounded year selector and update any affected form/tests

## 3. Shared Select Polish

- [x] 3.1 Upgrade the shared select styling to match the current glass/card visual system
- [x] 3.2 Verify the upgraded select control still works across affected admin/public pages

## 4. Verification And Archive

- [x] 4.1 Add or update frontend/backend tests for duplicate event feedback, dashboard quick actions, year selection, and duplicate-key prevention
- [x] 4.2 Run frontend lint/test/build, backend pytest/ruff, and any affected browser tests; fix regressions
- [x] 4.3 Sync the approved spec changes back into `openspec/specs`, archive the change, and commit the completed work
