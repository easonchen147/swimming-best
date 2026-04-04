# progress-visualization Specification

## Purpose
Define how progress and compare charts are rendered so performance insights remain understandable and stable across layouts.

## Requirements

### Requirement: Performance improvement SHALL be visualized with bar-based deltas
The system SHALL show improvement deltas from the first recorded performance using bar-based visualization rather than the previous line chart view.

#### Scenario: Event analytics are rendered
- **WHEN** a visitor views swimmer event analytics
- **THEN** the system renders improvement bars, PB highlights, and benchmark reference lines when benchmark data is available

### Requirement: Progress and compare charts SHALL render with stable container dimensions
The system SHALL render progress and compare charts inside containers that provide deterministic width and height during initial paint.

#### Scenario: Analytics page mounts a chart
- **WHEN** an analytics page renders a chart component after initial load
- **THEN** the chart receives a non-zero container size and renders without layout warnings caused by missing dimensions

