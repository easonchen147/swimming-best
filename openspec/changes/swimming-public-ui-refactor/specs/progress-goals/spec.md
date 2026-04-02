## MODIFIED Requirements

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals for a swimmer and event, including milestone relationships and progress toward a target time by a target date. Goals SHALL default to `isPublic: true` when created, so they appear on public pages without requiring explicit opt-in.

#### Scenario: Administrator creates a short-term goal
- **WHEN** an administrator stores a goal with swimmer, event, target time, target date, and horizon
- **THEN** the system stores the goal with `isPublic` defaulting to `true` and records the baseline used for progress calculations

#### Scenario: Goal progress is requested
- **WHEN** a goal progress payload is requested
- **THEN** the system returns the current best, target, baseline, and normalized progress state, visualized as a gauge indicator

## MODIFIED Requirements

### Requirement: The system SHALL detect PB and expose progress analytics
For each swimmer and structured event, the system SHALL compute PB status, best-so-far history, and trend-ready series from valid results. The analytics response SHALL include `sourceType` for each raw performance data point.

#### Scenario: New valid result beats the previous best
- **WHEN** a newly recorded valid result is faster than the swimmer's previous best result for the same structured event
- **THEN** the system marks the result as a PB improvement and updates the best-so-far state

#### Scenario: Result series is requested for charts
- **WHEN** analytics are requested for a swimmer and event
- **THEN** the system returns raw valid results (including sourceType), PB envelope data, and trend-ready series data

## REMOVED Requirements

### Requirement: The system SHALL compare swimmers only within the same event
**Reason**: Multi-swimmer comparison feature removed per user decision. Self-comparison via PB envelope and improvement bars is sufficient.
**Migration**: The compare API endpoint remains functional but is no longer called by the frontend. Compare-related UI components are removed.
