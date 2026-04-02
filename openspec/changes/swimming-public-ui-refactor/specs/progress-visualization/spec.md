## ADDED Requirements

### Requirement: Performance improvement SHALL be visualized with bar-based deltas
The system SHALL replace line charts with horizontal bar charts that show the improvement delta (time saved) from the first recorded time for each performance. Each bar MUST be labeled with the absolute improvement value (e.g., "-2.3s") so progress magnitude is immediately visible.

#### Scenario: Swimmer has multiple performances for an event
- **WHEN** a visitor views a swimmer's event analytics
- **THEN** the system renders a bar chart where each bar represents the improvement (time reduction) from the first recorded time, with labeled delta values

#### Scenario: Swimmer has only one performance
- **WHEN** a swimmer has a single performance for an event
- **THEN** the system renders a baseline indicator with no improvement bars and a message indicating more data is needed

#### Scenario: Performance is slower than the first time
- **WHEN** a performance time is slower than the first recorded time
- **THEN** the bar extends in the opposite direction with a distinct color indicating regression, labeled with the positive delta

### Requirement: Goal distance SHALL be visualized with gauge indicators
The system SHALL display each goal using a radial or arc gauge showing the swimmer's current position between baseline time and target time. The gauge MUST clearly indicate: baseline (starting point), current best (progress position), and target (end point), with labeled time values.

#### Scenario: Goal has measurable progress
- **WHEN** a swimmer's current best time is between baseline and target
- **THEN** the gauge fills proportionally to show progress percentage, with baseline, current, and target times labeled

#### Scenario: Goal is achieved
- **WHEN** a swimmer's current best time equals or surpasses the target time
- **THEN** the gauge shows 100% completion with a visual success indicator

#### Scenario: No progress toward goal
- **WHEN** a swimmer's current best time has not improved from the baseline
- **THEN** the gauge shows 0% progress with baseline and target times labeled

### Requirement: PB envelope SHALL be shown as an overlay on improvement bars
The system SHALL overlay PB markers on the improvement bar chart to indicate which performances set a new personal best, making PB breakthroughs visually distinct from regular improvements.

#### Scenario: A performance sets a new PB
- **WHEN** a performance time is the best so far for that event
- **THEN** the corresponding bar in the improvement chart SHALL display a PB marker icon or highlight
