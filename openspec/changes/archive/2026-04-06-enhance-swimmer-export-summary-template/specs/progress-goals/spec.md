## MODIFIED Requirements

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals
for a swimmer and event, including milestone relationships and operator-facing
metadata that should survive round-trips through the admin API. Goal-derived
progress summaries SHALL also be available to swimmer summary export templates.

#### Scenario: Administrator opens a swimmer summary export
- **WHEN** an administrator opens the summary export for one swimmer
- **THEN** the export includes achieved goals, active milestone context, and
  the next meaningful goal gap when that data exists
