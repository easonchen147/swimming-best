## MODIFIED Requirements

### Requirement: The system SHALL support quick single-result entry
The system SHALL allow administrators to record a single swimmer result without
first creating a visible session entry flow. The stored data MUST still
preserve a source type and recording context under the hood, and admin-facing
result flows MUST expose enough swimmer identity detail, including the
swimmer's managed team, to distinguish similarly named children. User-facing
entry flows for result times SHALL use seconds with decimal precision rather
than raw milliseconds, and date selection SHALL use the shared picker-style
date control rather than an unstyled native date field.

#### Scenario: Administrator records one quick result for a swimmer on a managed team
- **WHEN** an administrator submits a swimmer, event, result time in seconds,
  source type, date, and optional note through quick entry
- **THEN** the system stores a new result tied to an internal context and
  returns the stored record with swimmer identity and managed team data that
  remain unambiguous in admin workflows

### Requirement: The system SHALL support context-based batch entry
The system SHALL allow administrators to create a training, test, or
competition context and attach multiple performance records to that context.
User-facing context-entry flows SHALL also use seconds-based result values and
the shared picker-style date control.

#### Scenario: Administrator creates a test context with multiple results
- **WHEN** an administrator submits a context and multiple valid result entries
  using seconds-based times
- **THEN** the system stores the context and all attached results
