## MODIFIED Requirements

### Requirement: Fixed admins SHALL authenticate through hashed credentials
The system SHALL allow only administrators defined in configuration to log in. The login interface SHALL be modernized with a highly aesthetic, centered "card" layout featuring smooth entry animations, refined typography, and fluid state feedback (e.g., loading spinners, error shakes). Credentials MUST continue to be stored and validated as hashes.

#### Scenario: Valid admin logs in successfully
- **WHEN** a configured administrator submits a valid username and password
- **THEN** the system performs a smooth transition from the login view to the
  admin dashboard using a fluid "entry" animation

#### Scenario: Invalid admin credentials are rejected
- **WHEN** a login request contains an unknown username or incorrect password
- **THEN** the system provides immediate, high-quality visual feedback (e.g., a
  subtle shake animation or fluid error message appear) while rejecting the access

### Requirement: Admin routes SHALL require an authenticated session
The system SHALL protect management APIs and management pages behind authenticated admin sessions. The "Unauthorized" and "Loading" states for these routes MUST use the modern design system, featuring polished typography, refined layouts, and fluid transitions.

#### Scenario: Anonymous request reaches admin API
- **WHEN** an unauthenticated request is sent to an admin API
- **THEN** the system rejects the request and smoothly redirects the user to
  the modernized login page

#### Scenario: Authenticated request reaches admin API
- **WHEN** an authenticated administrator requests an admin API
- **THEN** the system allows the request and renders the target page with a
  polished, orchestrated entry animation
