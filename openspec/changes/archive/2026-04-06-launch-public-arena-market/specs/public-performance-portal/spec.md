## MODIFIED Requirements

### Requirement: Public primary navigation SHALL present top-level destinations as buttons
The public header SHALL render the top-level destinations for home, arena, and
admin entry as full buttons built from the shared action component layer. The
previous user-facing “对比” label SHALL be replaced by “竞技场”.

#### Scenario: Visitor opens the public header on desktop
- **WHEN** a visitor loads a public page on a desktop viewport
- **THEN** the header shows button-style navigation for home, arena, and
  admin entry

#### Scenario: Visitor opens the public header on mobile
- **WHEN** a visitor loads a public page on a phone-sized viewport
- **THEN** the same three destinations remain visible as tappable buttons in a
  compact layout without losing their visual distinction

## MODIFIED Requirements

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide a public arena experience for discovering same-race
competition across visible swimmers. The main public entry that previously
surfaced compare interactions SHALL now surface the arena market board first.
Legacy `/compare` access SHALL remain compatible by resolving to the arena
experience.

#### Scenario: Visitor opens the public arena page
- **WHEN** a visitor opens the public arena experience
- **THEN** the page presents a market-style race board instead of requiring the
  visitor to first select two swimmers

#### Scenario: Visitor opens a legacy compare route
- **WHEN** a visitor requests the old `/compare` route
- **THEN** the frontend resolves that request to the current public arena
  experience instead of failing or showing outdated compare-first UX
