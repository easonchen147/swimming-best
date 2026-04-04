## MODIFIED Requirements

### Requirement: Exported PB indicators SHALL use the same validity rules as analytics
The system SHALL mark PB rows in CSV exports using the same valid-result-only rules used by analytics and public progress calculations.

#### Scenario: Export contains invalid and valid results
- **WHEN** a swimmer has both valid and invalid results for the same event
- **THEN** the exported PB indicator only considers valid results when marking PB rows

