## 1. OpenSpec And Migration Baseline

- [x] 1.1 Finalize the new OpenSpec migration change artifacts and align them with the existing in-progress system capabilities
- [x] 1.2 Review the partial Go/Next.js implementation and map the Python replacement scope, API compatibility targets, and missing pages

## 2. Python Backend Foundation

- [x] 2.1 Initialize the Python backend with Poetry, Flask, pytest, SQLite schema/bootstrap, and root/backend run scripts
- [x] 2.2 Implement fixed-admin authentication, session protection, config loading, and shared backend test fixtures
- [x] 2.3 Implement swimmer, event, context, performance, goal, and analytics persistence/services in Python

## 3. Team Support And API Completion

- [x] 3.1 Add swimmer team/group support to schema, repositories, admin APIs, public APIs, and analytics-safe payloads
- [x] 3.2 Complete admin API coverage for roster editing, listings, result workflows, goals, and dashboard/supporting data
- [x] 3.3 Complete public API coverage for roster, swimmer detail, event detail, compare, and share-oriented views
- [x] 3.4 Validate backend behavior with Python automated tests that cover auth, admin, public, analytics, and team/group scenarios

## 4. Frontend Completion

- [x] 4.1 Update frontend API clients, types, and shared utilities to target the Python backend payloads
- [x] 4.2 Complete admin pages for login protection, dashboard, swimmer roster management, event management, result entry, and goal management
- [x] 4.3 Complete public pages for swimmer roster, swimmer detail, event detail, compare, and share experiences with team/group display where appropriate
- [x] 4.4 Validate frontend behavior, responsive layouts, and key flows with automated tests and production build checks

## 5. Go Removal And Documentation

- [x] 5.1 Delete all Go source, modules, configs, tests, build files, and script references once the Python backend replacement is verified
- [x] 5.2 Update README, package scripts, backend instructions, and developer verification commands to reflect the Python stack only

## 6. Final Verification, Review, And Release

- [x] 6.1 Run backend and frontend verification from a clean state and capture the actual results
- [x] 6.2 Perform a self code review, fix issues found, and re-run affected verification
- [x] 6.3 Mark the previous and new OpenSpec changes complete, archive them with synced specs, and commit the verified final state
