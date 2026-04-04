## Requirements

### Requirement: Public timeline SHALL display performance source type
The public-facing performance timeline and analytics views SHALL display the
source type for each performance record. The source type MUST be fetched from
the associated `record_context` and included in the analytics API response.

#### Scenario: Public analytics response includes source type
- **WHEN** a visitor requests event analytics for a swimmer
- **THEN** each raw performance data point in the response SHALL include a
  `sourceType` field from the associated record context
