## ADDED Requirements

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
