## ADDED Requirements

### Requirement: Fixed admins SHALL authenticate through hashed credentials
The system SHALL allow only administrators defined in configuration to log in. Administrator passwords MUST be stored and validated as hashes, and successful authentication MUST establish a session suitable for protecting admin routes.

#### Scenario: Valid admin logs in successfully
- **WHEN** a configured administrator submits a valid username and password
- **THEN** the system authenticates the request and returns a session for subsequent admin access

#### Scenario: Invalid admin credentials are rejected
- **WHEN** a login request contains an unknown username or incorrect password
- **THEN** the system rejects the request without issuing an authenticated session

### Requirement: Admin routes SHALL require an authenticated session
The system SHALL protect management APIs and management pages behind authenticated admin sessions.

#### Scenario: Anonymous request reaches admin API
- **WHEN** an unauthenticated request is sent to an admin API
- **THEN** the system rejects the request as unauthorized

#### Scenario: Authenticated request reaches admin API
- **WHEN** an authenticated administrator requests an admin API
- **THEN** the system allows the request to proceed

