## MODIFIED Requirements

### Requirement: Animated Chart Entry
Public comparison visualizations SHALL support a market-board style heatmap
visualization in addition to traditional charts. Arena tiles SHALL animate into
position when the arena board loads or filters change.

#### Scenario: Arena board loads
- **WHEN** the visitor opens the public arena page or changes arena filters
- **THEN** the heatmap tiles animate into position smoothly instead of popping
  into place abruptly

## ADDED Requirements

### Requirement: Arena market board SHALL encode scale and heat
The public arena visualization SHALL encode race arena scale and race arena
heat separately so visitors can distinguish “many competitors” from “highly
competitive” arenas.

#### Scenario: Visitor scans the market board
- **WHEN** the arena market board is rendered
- **THEN** each tile uses one visual dimension for arena size and another for
  arena heat, while still highlighting the leading swimmer for that arena

### Requirement: Arena detail SHALL support interactive drill-down
Selecting a market tile SHALL update a detailed panel for that exact race
arena, including leaderboard and summary metrics, without leaving the page.

#### Scenario: Visitor selects an arena tile
- **WHEN** a visitor clicks or taps one tile on the arena market board
- **THEN** the page updates a detail panel showing the selected arena's ranking
  list and summary data
