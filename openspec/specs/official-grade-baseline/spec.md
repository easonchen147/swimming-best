## Requirements

### Requirement: The system SHALL expose a read-only official swimming grade baseline
The system SHALL ship with a project-owned, versioned, read-only official
swimming grade baseline derived from the checked-in male and female reference
tables, and it SHALL use that baseline to evaluate valid swimmer performances
without requiring administrators to manually maintain the official standard.

#### Scenario: Official baseline is loaded
- **WHEN** the application starts and official grade data is needed
- **THEN** the system loads the checked-in official baseline resource, including
  version metadata and all supported entries, as a read-only configuration

#### Scenario: Event has an official baseline entry
- **WHEN** a swimmer with a known gender requests analytics for an event that
  maps to a supported official baseline row
- **THEN** the system returns the current achieved official grade, the next
  official grade if one exists, and the remaining gap in milliseconds

#### Scenario: Event is not covered by the official baseline
- **WHEN** analytics are requested for an event or pool-length combination that
- has no official baseline row in the checked-in resource
- **THEN** the system returns no official grade result and marks the status as
  unavailable for that event
