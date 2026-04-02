## 1. OpenSpec Alignment

- [x] 1.1 Finalize the new change artifacts so they explicitly replace the
  incorrect free-text team/group model with managed team entities
- [x] 1.2 Verify the affected capabilities and archived-context follow-up notes
  are documented honestly before implementation starts

## 2. Backend Schema And API Refactor

- [x] 2.1 Add failing backend tests for managed team CRUD, swimmer assignment by
  `teamId`, and team-aware admin/public roster filtering
- [x] 2.2 Refactor SQLite bootstrap/migration logic to create `teams`, migrate
  legacy `team_name` data, and store swimmer ownership via `team_id`
- [x] 2.3 Update repository/service/admin routes/public routes so team data is
  returned as structured entities and swimmer assignment uses managed teams only
- [x] 2.4 Re-run backend tests and fix any schema/API regressions until the
  managed team flow passes end-to-end

## 3. Frontend Admin And Public Rework

- [x] 3.1 Add failing frontend tests for team management, swimmer team
  selection, and team-aware roster/detail rendering
- [x] 3.2 Refactor shared frontend types and API clients from `teamName` text to
  `teamId + team` managed-entity payloads
- [x] 3.3 Update admin UI so teams can be created/edited and swimmers are
  assigned through managed team selection rather than free-text input
- [x] 3.4 Update public/admin roster, detail, compare, share, and dashboard
  displays so filtering and labels use managed team data consistently
- [x] 3.5 Re-run frontend tests, lint, and build until the UI is aligned with
  backend interfaces

## 4. Review, Verification, And Release

- [x] 4.1 Perform code review on the final diff, fix all important findings, and
  record what changed
- [x] 4.2 Run full functional verification for backend and frontend, including
  interface-alignment checks for managed team flows
- [x] 4.3 Archive the new change only after review and verification pass
- [x] 4.4 Commit the verified final state to git with the new change archived
