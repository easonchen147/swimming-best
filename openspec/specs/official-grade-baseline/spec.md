## Requirements

### Requirement: The system SHALL expose a read-only official swimming grade baseline
The system SHALL ship with a project-owned, versioned, read-only official
swimming grade baseline derived from the checked-in male and female reference
tables, and it SHALL use that baseline to evaluate valid swimmer performances
without requiring administrators to manually maintain the official standard.
The built-in official baseline SHALL be the default benchmark source for the
product and SHALL match swimmers to applicable standards by gender and the
selected structured event. Event definitions themselves remain gender-neutral;
gender only affects which threshold row is selected. Official grade summaries
SHALL also be reusable in swimmer summary export templates.

#### Scenario: Official baseline is loaded
- **WHEN** the application starts and official grade data is needed
- **THEN** the system loads the checked-in official baseline resource, including
  version metadata and all supported entries, as a read-only configuration

#### Scenario: Event has an official baseline entry
- **WHEN** a swimmer with a known gender requests analytics for an event that
  maps to a supported official baseline row
- **THEN** the system returns the current achieved official grade, the next
  official grade if one exists, and ordered official benchmark thresholds that
  include qualifying time, achieved state, and remaining gap milliseconds

#### Scenario: Swimmer gender is missing
- **WHEN** analytics are requested for a swimmer whose gender is unknown
- **THEN** the system returns no official grade result, no official benchmark
  thresholds, and marks the status as missing gender

#### Scenario: Standard management is not required for the default workflow
- **WHEN** an administrator manages swimmers, goals, records, or public views
- **THEN** the built-in official baseline is available without requiring any
  manual benchmark entry in the admin workflow

#### Scenario: Administrator opens a swimmer summary export
- **WHEN** an administrator opens the summary export for one swimmer
- **THEN** the export includes the swimmer's current official grade and next
  official grade gap when the required data exists
