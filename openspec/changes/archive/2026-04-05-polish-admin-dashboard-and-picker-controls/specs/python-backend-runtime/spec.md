## MODIFIED Requirements

### Requirement: Backend APIs SHALL be served by a Python Flask service backed by SQLite
The system SHALL provide the protected admin APIs, public read-only APIs, and
health endpoint through a Python backend that persists application data in
SQLite. Linux-oriented deployment and shell startup paths SHALL prefer Gunicorn
over Waitress as the production-facing WSGI server.

#### Scenario: Backend starts successfully on the Python stack
- **WHEN** a developer or operator starts the backend with the documented shell
  or production-oriented command
- **THEN** the service starts successfully and serves `/healthz`, `/api/admin/*`,
  and `/api/public/*` without relying on Flask's development server

### Requirement: Repository runtime references SHALL use Python tooling after migration
Once the Python backend replacement is complete, the repository SHALL use
Python tooling for backend setup, execution, and verification, and SHALL no
longer reference the legacy Go backend workflow. The documented Linux-facing
runtime path SHALL reference Gunicorn.

#### Scenario: Developer follows repository instructions after migration
- **WHEN** a developer reads backend runtime instructions or runs the Linux
  startup script
- **THEN** the production-facing backend instructions reference Python, Poetry,
  uv, Gunicorn, and pytest rather than Go tooling or Waitress-first guidance
