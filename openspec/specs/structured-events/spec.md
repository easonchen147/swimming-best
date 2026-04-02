# structured-events Specification

## Purpose
TBD - created by archiving change build-swimming-performance-system. Update Purpose after archive.
## Requirements
### Requirement: Events SHALL be defined with structured performance dimensions
The system SHALL define swim events using pool length, event distance, stroke, and effort type so that analytics can consistently bucket results.

#### Scenario: Administrator creates a valid event
- **WHEN** an administrator submits a unique combination of pool length, event distance, stroke, and effort type
- **THEN** the system stores the event and returns a display-ready event definition

#### Scenario: Administrator submits a duplicate event combination
- **WHEN** an administrator submits an event whose structured dimensions match an existing event
- **THEN** the system rejects the duplicate event

### Requirement: Events SHALL support admin display and public display
The system SHALL provide an admin-friendly and public-friendly display name for each structured event while keeping the underlying identity stable.

#### Scenario: Public page reads event metadata
- **WHEN** a public endpoint returns event metadata
- **THEN** the payload includes a display name derived from the stable structured event identity

