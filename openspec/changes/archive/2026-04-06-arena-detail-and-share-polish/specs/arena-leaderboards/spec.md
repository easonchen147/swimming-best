## ADDED Requirements

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
