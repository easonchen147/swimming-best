## REMOVED Requirements

### Requirement: Performance improvement SHALL be visualized with bar-based deltas
**Reason**: The public analytics experience now needs an event-specific growth
curve that compares actual performance times against goals and official grade
thresholds in one view, which is not well expressed as first-result delta bars.
**Migration**: Replace the delta-bar-only visualization with a benchmark-aware
time-based growth chart that plots raw results, PB progression, and reference
lines on the same axis.

## ADDED Requirements

### Requirement: Performance progression SHALL be visualized as a benchmark-aware growth curve
The system SHALL render swimmer event analytics as a time-based growth curve
that plots actual performances, highlights PB progress, and overlays applicable
official grade lines, public goal lines, and custom benchmark lines when that
data is available.

#### Scenario: Event analytics are rendered
- **WHEN** a visitor views swimmer event analytics
- **THEN** the system renders a time-based growth chart with performance points,
  PB guidance, and reference lines for every available benchmark source

#### Scenario: A performance sets a new PB
- **WHEN** a new point improves the swimmer's best time for the selected event
- **THEN** the chart highlights that point as a PB and keeps the PB envelope
  visible alongside the raw progression line

#### Scenario: Benchmark sources are available
- **WHEN** official grades, public goals, or custom standards exist for the
  selected event
- **THEN** the chart uses distinct styling and labels so visitors can tell which
  lines come from official grades, goals, and custom standards

### Requirement: Progress gaps SHALL be summarized next to the growth curve
The system SHALL summarize the swimmer's remaining distance to visible goals and
official grade thresholds in the same analytics view as the growth curve.

#### Scenario: Visitor opens a benchmark-aware analytics view
- **WHEN** the analytics page renders a chart with goals or official grade
  thresholds
- **THEN** the page shows a readable gap summary that states whether each target
  is achieved or how many milliseconds remain

## MODIFIED Requirements

### Requirement: Progress and compare charts SHALL render with stable container dimensions
The system SHALL render progress and compare charts inside containers that
provide deterministic width and height during initial paint, and benchmark-rich
analytics layouts SHALL keep chart legends and gap summaries inside the page
without horizontal overflow on supported viewport sizes.

#### Scenario: Analytics page mounts a chart
- **WHEN** an analytics page renders a chart component after initial load
- **THEN** the chart receives a non-zero container size and renders without
  layout warnings caused by missing dimensions
