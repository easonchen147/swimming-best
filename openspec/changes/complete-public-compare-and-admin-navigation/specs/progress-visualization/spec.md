## MODIFIED Requirements

### Requirement: Progress and compare charts SHALL render with stable container dimensions
The system SHALL render progress and compare charts inside containers that provide deterministic width and height during initial paint.

#### Scenario: Analytics page mounts a chart
- **WHEN** an analytics page renders a chart component after initial load
- **THEN** the chart receives a non-zero container size and renders without layout warnings caused by missing dimensions

