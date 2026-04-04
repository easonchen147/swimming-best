# progress-goals Specification

## Purpose
Define PB analytics, raw progress data, and swimmer goal tracking.

## Requirements

### Requirement: The system SHALL detect PB and expose progress analytics
For each swimmer and structured event, the system SHALL compute PB status, best-so-far history, and trend-ready series from valid results. The analytics response SHALL include `sourceType` for each raw performance data point.

#### Scenario: New valid result beats the previous best
- **WHEN** a newly recorded valid result is faster than the swimmer's previous best result for the same structured event
- **THEN** the system marks the result as a PB improvement and updates the best-so-far state

#### Scenario: Result series is requested
- **WHEN** analytics are requested for a swimmer and event
- **THEN** the system returns raw valid results, PB envelope data, and trend-ready series data

### Requirement: The system SHALL track milestone goals by swimmer and event
The system SHALL let administrators create short-, mid-, and long-horizon goals for a swimmer and event, including milestone relationships and operator-facing metadata that should survive round-trips through the admin API. Goals SHALL default to `isPublic: true` when created.

#### Scenario: Administrator creates a short-term goal
- **WHEN** an administrator stores a goal with swimmer, event, target time, target date, and horizon
- **THEN** the system stores the goal with `isPublic` defaulting to `true` and records the baseline used for progress calculations

#### Scenario: Administrator creates a goal with supported metadata
- **WHEN** an administrator creates a goal and supplies supported metadata such as public visibility or notes
- **THEN** the system stores and returns that metadata through the admin API

#### Scenario: Goal progress is requested
- **WHEN** a goal progress payload is requested
- **THEN** the system returns the current best, target, baseline, and normalized progress state

