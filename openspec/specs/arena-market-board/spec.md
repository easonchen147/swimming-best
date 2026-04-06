# arena-market-board Specification

## Purpose
Define the public arena competition surfaces that expose race-scoped
leaderboard groups for visible swimmers.

## Requirements

### Requirement: Public arena SHALL expose race-scoped leaderboard groups
The system SHALL provide public arena leaderboard groups built from public
swimmers' best valid performances, grouped strictly by the same structured
event and the selected ranking scope.

#### Scenario: Visitor loads the arena page
- **WHEN** a visitor opens the public arena page
- **THEN** the system returns race leaderboard groups built from public
  swimmers' best valid performances, where each group corresponds to one
  structured event and one selected ranking scope only

#### Scenario: Unknown-gender swimmer exists
- **WHEN** a public swimmer has `gender = unknown`
- **THEN** that swimmer does not appear in the main arena groups

### Requirement: Arena groups SHALL expose leaderboard metadata
Each arena group SHALL expose enough metadata for a leaderboard-first arena
experience, including leader identity, leader best time, competitor count,
leader gap, relative advantage, and a ranking list for that exact arena.

#### Scenario: Visitor inspects one arena leaderboard card
- **WHEN** a visitor inspects an arena group on the page
- **THEN** the system provides the leader swimmer, leader best time,
  competitor count, relative leader advantage, and ranking list for that exact
  arena

### Requirement: Arena filters SHALL preserve race boundaries
The public arena API SHALL support filtering by pool length, gender, and team
without merging incompatible race arenas together.

#### Scenario: Visitor filters to female short-course arenas
- **WHEN** a visitor requests the arena board with `gender = female` and
  `poolLengthM = 25`
- **THEN** the system returns only female short-course race arenas
