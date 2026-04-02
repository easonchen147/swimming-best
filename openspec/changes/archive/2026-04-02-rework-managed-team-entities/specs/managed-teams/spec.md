## ADDED Requirements

### Requirement: The system SHALL manage first-class team entities
The system SHALL allow administrators to create, list, and update team entities
that are managed independently from swimmer profiles. Team entities MUST have a
stable identifier and a unique name, and MUST NOT be hardcoded to example values
such as `A`, `B`, or `C`.

#### Scenario: Administrator creates a managed team
- **WHEN** an administrator submits a valid new team name
- **THEN** the system stores a new team entity with its own identifier and makes
  it available to swimmer assignment workflows

#### Scenario: Administrator updates a managed team
- **WHEN** an administrator edits an existing team entity and changes its name or
  status
- **THEN** the system persists the updated team entity and subsequent swimmer and
  roster payloads reflect the updated team details

### Requirement: The system SHALL expose managed teams for admin selection
The system SHALL provide an admin-facing team directory API that returns the
current managed teams for dashboard counts, swimmer assignment, and roster
filtering workflows.

#### Scenario: Administrator requests the managed team list
- **WHEN** an authenticated administrator requests the team directory
- **THEN** the system returns the managed teams with stable identifiers and
  display data needed by admin workflows
