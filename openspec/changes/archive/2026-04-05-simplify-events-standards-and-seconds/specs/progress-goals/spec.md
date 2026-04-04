## MODIFIED Requirements

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals
for a swimmer and event, including milestone relationships and operator-facing
metadata that should survive round-trips through the admin API. Goals SHALL
default to `isPublic: true` when created. Goal creation and user-facing goal
views SHALL use seconds-based target and baseline values.

#### Scenario: Administrator creates a short-term goal
- **WHEN** an administrator stores a goal with swimmer, event, target time in
  seconds, target date, and horizon
- **THEN** the system stores the goal with `isPublic` defaulting to `true` and
  records the baseline used for progress calculations

#### Scenario: Administrator creates a goal with supported metadata
- **WHEN** an administrator creates a goal and supplies supported metadata such
  as public visibility or notes
- **THEN** the system stores and returns that metadata through the admin API

#### Scenario: Goal progress is requested
- **WHEN** a goal progress payload is requested
- **THEN** the system returns the current best, target, baseline, and
  normalized progress state using seconds-based values in the user-facing view
