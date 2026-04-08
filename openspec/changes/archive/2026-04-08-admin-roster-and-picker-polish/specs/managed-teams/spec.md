## MODIFIED Requirements

### Requirement: The system SHALL expose managed teams for admin selection
The system SHALL provide an admin-facing team directory API that returns the
current managed teams for dashboard counts, swimmer assignment, and roster
filtering workflows. The admin team directory SHALL also include the current
swimmer count for each managed team so operators can quickly understand team
size without opening another page.

#### Scenario: Administrator requests the managed team list
- **WHEN** an authenticated administrator requests the team directory
- **THEN** the system returns the managed teams with stable identifiers,
  display data needed by admin workflows, and each team's current swimmer count
