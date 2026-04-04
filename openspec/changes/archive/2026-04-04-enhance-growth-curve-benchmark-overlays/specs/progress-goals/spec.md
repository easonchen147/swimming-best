## MODIFIED Requirements

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals
for a swimmer and event, including milestone relationships and operator-facing
metadata that should survive round-trips through the admin API. Goals SHALL
default to `isPublic: true` when created. Public swimmer event analytics SHALL
return visible goals for the selected swimmer and event with progress metadata
that is sufficient for both target cards and growth-chart overlays, including
the current best, target, normalized progress, remaining gap milliseconds, and
achieved state.

#### Scenario: Administrator creates a short-term goal
- **WHEN** an administrator stores a goal with swimmer, event, target time,
  target date, and horizon
- **THEN** the system stores the goal with `isPublic` defaulting to `true` and
  records the baseline used for progress calculations

#### Scenario: Administrator creates a goal with supported metadata
- **WHEN** an administrator creates a goal and supplies supported metadata such
  as public visibility or notes
- **THEN** the system stores and returns that metadata through the admin API

#### Scenario: Goal progress is requested
- **WHEN** a goal progress payload is requested
- **THEN** the system returns the current best, target, baseline, normalized
  progress state, remaining gap milliseconds, and achieved state

#### Scenario: Public analytics exclude non-public goals
- **WHEN** a public swimmer event analytics payload is requested
- **THEN** the system includes only goals marked as public for the matching
  swimmer and event
