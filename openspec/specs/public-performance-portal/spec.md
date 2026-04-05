# public-performance-portal Specification

## Purpose
Define the public-facing roster, swimmer detail, event detail, compare, and
share experiences for visible swimmers.

## Requirements

### Requirement: Public primary navigation SHALL present top-level destinations as buttons
The public header SHALL render the top-level destinations for home, compare,
and admin entry as full buttons built from the shared action component layer.
Each button SHALL remain visually distinguishable from the others while
preserving the current site color system, and the visible button styling SHALL
be attached to the real navigation link root instead of a nested wrapper.

#### Scenario: Visitor opens the public header on desktop
- **WHEN** a visitor loads a public page on a desktop viewport
- **THEN** the header shows button-style navigation for home, compare, and
  admin entry instead of text-like links

#### Scenario: Visitor opens the public header on mobile
- **WHEN** a visitor loads a public page on a phone-sized viewport
- **THEN** the same three destinations remain visible as tappable buttons in a
  compact layout without losing their visual distinction

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that
are configured as publicly visible, and public payloads MUST use the swimmer's
configured public display identity. The public roster SHALL be presented in an
interactive card grid with hover effects and staggered entrance animations. The
public pages SHALL use the shared component layer rather than mixed raw
page-level controls.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system renders a public roster of visible swimmers including
  display name, team, and profile link as an interactive card grid using a
  staggered fade-in animation and the same shared component family used
  elsewhere in the frontend

#### Scenario: Public list is filtered by managed team
- **WHEN** a visitor requests the public swimmer listing with a managed team
  identifier filter
- **THEN** the system returns only visible swimmers assigned to that team

#### Scenario: Public swimmer detail is requested
- **WHEN** a visitor requests a public swimmer page for a visible swimmer
- **THEN** the system renders the swimmer summary, event summaries, and public
  analytics-safe details

### Requirement: Public pages SHALL expose benchmark-aware event analytics views
The system SHALL provide public swimmer and event-detail analytics views that
combine progression data, goal progress, and official grade guidance for the
currently selected structured event without requiring login. Analytics charts
SHALL be interactive and provide visual feedback for benchmark comparisons.
Public event labels and benchmark copy SHALL use Chinese project names that
distinguish short-course and long-course events.

#### Scenario: Visitor opens a public swimmer analytics page
- **WHEN** a visitor selects an event on a visible swimmer's public page
- **THEN** the page renders the selected event's growth chart, benchmark gap
  summary with visual indicators, and supporting public goal or official grade
  details using Chinese event names that clearly distinguish pool length

#### Scenario: Visitor opens a public event detail page
- **WHEN** a visitor opens the dedicated public event detail route for a visible
  swimmer
- **THEN** the page renders the same benchmark-aware growth guidance for that
  exact event and swimmer combination

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
