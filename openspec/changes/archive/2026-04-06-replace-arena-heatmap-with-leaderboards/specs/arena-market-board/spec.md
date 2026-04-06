## MODIFIED Requirements

### Requirement: Public arena SHALL expose race-scoped market groups
The system SHALL provide a public arena leaderboard view built from public
swimmers' best valid performances, grouped strictly by the same structured
event, optional age bucket, and the requested gender ranking mode. The arena
shall no longer depend on a heatmap to communicate the main competition view.

#### Scenario: Visitor loads the arena leaderboard
- **WHEN** a visitor opens the public arena page
- **THEN** the system returns leaderboard groups built from public swimmers'
  best valid performances, where each group still represents one structured
  event and one ranking scope only

#### Scenario: Visitor switches age mode
- **WHEN** a visitor changes the arena age mode from “不分年龄” to “按年龄段”
- **THEN** the system returns leaderboard groups split by the selected age
  bucket logic instead of the unrestricted total view

## ADDED Requirements

### Requirement: Arena leaderboards SHALL support ranking modes and age buckets
The public arena SHALL support ranking modes for male, female, and combined
leaderboards, and it SHALL support age-grouped or age-agnostic ranking views.

#### Scenario: Visitor requests a combined leaderboard
- **WHEN** a visitor selects the combined gender ranking mode
- **THEN** the system returns rankings scoped to the same event and pool length
  without requiring separate male/female partitions
