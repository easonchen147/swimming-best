## MODIFIED Requirements

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide public compare and share-oriented pages for PB, goal
progress, and same-event comparison views, and the frontend SHALL expose a
usable compare page that consumes the compare API directly. Comparison views
SHALL use interactive legends to toggle swimmer data visibility. These views
SHALL also use the shared component layer consistently across filters, action
buttons, and summary surfaces. The compare page SHALL require explicit swimmer
selection by the visitor instead of preselecting swimmers automatically, and it
SHALL only request comparison data after at least two swimmers and one event
have been selected.

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor requests a public compare page for one structured event
  and multiple visible swimmers
- **THEN** the page initially presents an explicit selection state instead of a
  preloaded comparison result, and only renders comparison data after the
  visitor manually selects the swimmers and event

#### Scenario: Visitor reaches compare from the public frontend
- **WHEN** a visitor navigates to the public compare experience from the
  frontend
- **THEN** the page lets the visitor select visible swimmers and a shared event
  without requiring login, without automatically choosing the first swimmer,
  and without showing a result loading state before the selection prerequisites
  are satisfied

#### Scenario: Visitor opens a PB share view
- **WHEN** a visitor opens a share view for a visible swimmer's PB summary
- **THEN** the system renders a share-friendly public presentation without
  admin-only controls

## ADDED Requirements

### Requirement: Public primary navigation SHALL present top-level destinations as buttons
The public header SHALL render the top-level destinations for home, compare,
and admin entry as full buttons built from the shared action component layer.
Each button SHALL remain visually distinguishable from the others while
preserving the current site color system.

#### Scenario: Visitor opens the public header on desktop
- **WHEN** a visitor loads a public page on a desktop viewport
- **THEN** the header shows button-style navigation for home, compare, and
  admin entry instead of text-like links

#### Scenario: Visitor opens the public header on mobile
- **WHEN** a visitor loads a public page on a phone-sized viewport
- **THEN** the same three destinations remain visible as tappable buttons in a
  compact layout without losing their visual distinction
