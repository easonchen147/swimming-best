## MODIFIED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review swimmer profiles for multiple children within one installation, including operator-facing roster metadata that influences profile display or downstream analysis.

#### Scenario: Administrator creates a swimmer with extended roster metadata
- **WHEN** an administrator submits a swimmer profile that includes supported roster metadata such as gender or notes
- **THEN** the system stores and returns those fields through the admin API

