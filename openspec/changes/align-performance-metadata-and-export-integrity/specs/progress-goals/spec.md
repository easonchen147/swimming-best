## MODIFIED Requirements

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals for a swimmer and event, including milestone relationships and operator-facing metadata that should survive round-trips through the admin API.

#### Scenario: Administrator creates a goal with supported metadata
- **WHEN** an administrator creates a goal and supplies supported metadata such as public visibility or notes
- **THEN** the system stores and returns that metadata through the admin API

