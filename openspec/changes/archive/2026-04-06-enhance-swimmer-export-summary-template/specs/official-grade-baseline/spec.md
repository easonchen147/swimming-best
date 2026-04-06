## MODIFIED Requirements

### Requirement: The system SHALL expose a read-only official swimming grade baseline
The system SHALL ship with a project-owned, versioned, read-only official
swimming grade baseline derived from the checked-in male and female reference
tables, and it SHALL use that baseline to evaluate valid swimmer performances
without requiring administrators to manually maintain the official standard.
Official grade summaries SHALL also be reusable in swimmer summary export
templates.

#### Scenario: Administrator opens a swimmer summary export
- **WHEN** an administrator opens the summary export for one swimmer
- **THEN** the export includes the swimmer's current official grade and next
  official grade gap when the required data exists
