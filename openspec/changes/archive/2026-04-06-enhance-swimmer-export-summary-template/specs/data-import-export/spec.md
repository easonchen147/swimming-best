## MODIFIED Requirements

### Requirement: The system SHALL support confirmed CSV import and CSV export
The system SHALL import validated rows transactionally and SHALL export
swimmer-level and team-level performance CSV files for downstream analysis.
The system SHALL also support a swimmer summary export template that is designed
for reading and sharing rather than only for raw spreadsheet processing.

#### Scenario: Administrator exports team results
- **WHEN** an administrator requests a team CSV export
- **THEN** the system returns a CSV file containing swimmer identity, event,
  source type, result status, and PB marker fields

#### Scenario: Administrator opens a swimmer summary export
- **WHEN** an administrator requests the summary export for one swimmer
- **THEN** the system returns a readable summary export view containing standout
  performance information, not just raw result rows
