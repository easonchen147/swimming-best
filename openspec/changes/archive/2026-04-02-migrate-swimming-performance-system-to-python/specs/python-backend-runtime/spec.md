## ADDED Requirements

### Requirement: Backend APIs SHALL be served by a Python Flask service backed by SQLite
The system SHALL provide the protected admin APIs, public read-only APIs, and health endpoint through a Python Flask backend that persists application data in SQLite.

#### Scenario: Backend starts successfully on the Python stack
- **WHEN** a developer starts the backend with the documented Python command
- **THEN** the service starts successfully and serves `/healthz`, `/api/admin/*`, and `/api/public/*`

#### Scenario: Existing product workflows remain reachable after migration
- **WHEN** the frontend or tests call the documented admin and public API routes
- **THEN** the Python backend handles those routes and preserves the system's login protection and core product workflows

### Requirement: Repository runtime references SHALL use Python tooling after migration
Once the Python backend replacement is complete, the repository SHALL use Python tooling for backend setup, execution, and verification, and SHALL no longer reference the legacy Go backend workflow.

#### Scenario: Developer follows repository instructions after migration
- **WHEN** a developer reads the root README or runs project scripts
- **THEN** the backend instructions and commands reference Python, Poetry, uv, Flask, and pytest rather than Go tooling

#### Scenario: Repository is inspected for backend implementation assets
- **WHEN** the migration is complete and the repository is searched for backend runtime assets
- **THEN** no Go backend source files, modules, tests, build files, or backend command references remain
