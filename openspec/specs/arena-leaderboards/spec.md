# arena-leaderboards Specification

## Purpose
Define the public arena leaderboard experience for comparing swimmers inside
strictly aligned race scopes.

## Requirements

### Requirement: Arena leaderboards SHALL compare swimmers within aligned race scopes
The system SHALL present public arena leaderboards that compare swimmers only
within the same structured event, pool length, and selected ranking mode.

#### Scenario: Visitor opens one arena leaderboard group
- **WHEN** a visitor opens the public arena leaderboard page
- **THEN** each leaderboard group represents one structured event and one
  selected ranking scope only

### Requirement: Arena leaderboards SHALL support gender and age dimensions
The public arena SHALL support male, female, and combined ranking modes, and it
SHALL support age-bucket filtering or an unrestricted age view.

#### Scenario: Visitor switches to an age bucket
- **WHEN** a visitor selects one age bucket
- **THEN** the arena page returns and renders rankings restricted to that age
  bucket
