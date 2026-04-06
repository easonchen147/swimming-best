## ADDED Requirements

### Requirement: Public arena SHALL expose race-scoped market groups
The system SHALL provide a public arena market board built from public swimmers'
best valid performances, grouped strictly by the same structured event and the
same swimmer gender. Each arena group SHALL therefore represent one race arena
such as `女子 50米自由泳（短池）`, never a cross-event comparison.

#### Scenario: Visitor loads the arena board
- **WHEN** a visitor opens the public arena page
- **THEN** the system returns race arena groups built from public swimmers'
  best valid performances, where each group corresponds to one structured event
  and one gender only

#### Scenario: Unknown-gender swimmer exists
- **WHEN** a public swimmer has `gender = unknown`
- **THEN** that swimmer does not appear in the main arena groups

### Requirement: Arena groups SHALL expose leader and heat metadata
Each arena group SHALL expose enough metadata for a heatmap-like market board,
including leader identity, leader best time, competitor count, a normalized
heat score, and a leaderboard for that exact arena.

#### Scenario: Visitor inspects one arena tile
- **WHEN** a visitor inspects an arena group on the board
- **THEN** the system provides the leader swimmer, leader best time,
  competitor count, heat score, and ranking list for that exact arena

### Requirement: Arena filters SHALL preserve race boundaries
The public arena API SHALL support filtering by pool length, gender, and team
without merging incompatible race arenas together.

#### Scenario: Visitor filters to female short-course arenas
- **WHEN** a visitor requests the arena board with `gender = female` and
  `poolLengthM = 25`
- **THEN** the system returns only female short-course race arenas
