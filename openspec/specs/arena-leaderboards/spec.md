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

### Requirement: Arena leaderboards SHALL use a detail-first primary analysis view
The public arena SHALL present one primary race analysis surface for the
currently selected race group, and race-group switching controls MUST NOT
duplicate the same leaderboard content in a second heavyweight panel.

#### Scenario: Visitor opens the arena page
- **WHEN** a visitor opens the public arena leaderboard experience
- **THEN** the page shows one primary race detail surface for the current race
  group instead of rendering two competing heavyweight leaderboard views with
  overlapping ranking content

#### Scenario: Visitor switches race groups
- **WHEN** a visitor selects another visible race group inside the arena
- **THEN** the primary race detail surface updates to that group and the
  supporting selector remains lighter-weight than the detail surface itself

### Requirement: Arena leaderboards SHALL expose selected-race summary metrics
The public arena summary area MUST display metrics that help explain the
currently selected race group, and summary metrics MUST NOT rely on an implicit
first filtered group when that group is not the visitor's current selection.

#### Scenario: Visitor selects a different race group
- **WHEN** a visitor changes the selected race group
- **THEN** any selected-race summary metric updates to the same group instead of
  continuing to describe a different filtered group

### Requirement: Arena leaderboards SHALL keep race switching inside the primary detail surface
The public arena SHALL keep race-group switching available without rendering a
separate standalone “赛道切换” card, and visitors MUST be able to change race
groups from inside the primary detail surface.

#### Scenario: Visitor opens the arena page
- **WHEN** a visitor opens the public arena leaderboard experience
- **THEN** the page does not render a separate standalone race-switch card and
  instead keeps the switching controls inside the main race-detail surface

### Requirement: Arena leaderboards SHALL visually emphasize the top three ranks
The race-detail leaderboard SHALL give ranks 1 through 3 stronger visual
prominence than the rest of the list while preserving the current arena theme.

#### Scenario: Visitor views a populated race ranking
- **WHEN** the selected race group contains at least three ranked swimmers
- **THEN** ranks 1, 2, and 3 render with distinct podium-style emphasis that is
  visually stronger than ranks below them
