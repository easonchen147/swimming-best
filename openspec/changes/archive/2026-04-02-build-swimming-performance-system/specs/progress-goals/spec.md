## ADDED Requirements

### Requirement: The system SHALL detect PB and expose progress analytics
For each swimmer and structured event, the system SHALL compute PB status, best-so-far history, and trend-ready series from valid results.

#### Scenario: New valid result beats the previous best
- **WHEN** a newly recorded valid result is faster than the swimmer's previous best result for the same structured event
- **THEN** the system marks the result as a PB improvement and updates the best-so-far state

#### Scenario: Result series is requested for charts
- **WHEN** analytics are requested for a swimmer and event
- **THEN** the system returns raw valid results, PB envelope data, and trend-ready series data

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals for a swimmer and event, including milestone relationships and progress toward a target time by a target date.

#### Scenario: Administrator creates a short-term goal
- **WHEN** an administrator stores a goal with swimmer, event, target time, target date, and horizon
- **THEN** the system stores the goal and records the baseline used for progress calculations

#### Scenario: Goal progress is requested
- **WHEN** a goal progress payload is requested
- **THEN** the system returns the current best, target, baseline, and normalized progress state

### Requirement: The system SHALL compare swimmers only within the same event
The system SHALL expose comparison analytics only for swimmers measured on the same structured event.

#### Scenario: Compare request mixes swimmers for one event
- **WHEN** a compare request names multiple swimmers and one structured event
- **THEN** the system returns aligned series and summary metrics for that event

#### Scenario: Compare request lacks a structured event
- **WHEN** a compare request does not identify a structured event
- **THEN** the system rejects the request

