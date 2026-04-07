# public-performance-portal Specification

## Purpose
Define the public-facing roster, swimmer detail, event detail, compare, and
share experiences for visible swimmers.

## Requirements

### Requirement: Public primary navigation SHALL present top-level destinations as buttons
The public header SHALL render the top-level destinations for home, arena,
and admin entry as full buttons built from the shared action component layer.
Each button SHALL remain visually distinguishable from the others while
preserving the current site color system, and the visible button styling SHALL
be attached to the real navigation link root instead of a nested wrapper.

#### Scenario: Visitor opens the public header on desktop
- **WHEN** a visitor loads a public page on a desktop viewport
- **THEN** the header shows button-style navigation for home, arena, and
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

### Requirement: Public pages SHALL support arena and share views
The system SHALL provide a public arena experience for discovering same-race
competition across visible swimmers. The main public entry that previously
surfaced compare interactions SHALL now surface the arena market board first.
Legacy `/compare` access SHALL remain compatible by resolving to the current
arena experience.

#### Scenario: Visitor opens the public arena page
- **WHEN** a visitor opens the public arena experience
- **THEN** the page presents a market-style race board instead of requiring the
  visitor to first select two swimmers

#### Scenario: Visitor opens a legacy compare route
- **WHEN** a visitor requests the old `/compare` route
- **THEN** the frontend resolves that request to the current public arena
  experience instead of failing or showing outdated compare-first UX

#### Scenario: Visitor opens a PB share view
- **WHEN** a visitor opens a share view for a visible swimmer's PB summary
- **THEN** the system renders a share-friendly public presentation without
  admin-only controls

### Requirement: Public swimmer detail pages SHALL support full-growth poster export
The public swimmer detail page MUST provide a save/share export that captures
the swimmer hero, current metric cards, and the visible growth-analysis content
for the selected event, instead of exporting only the top hero block.

#### Scenario: Visitor saves a public swimmer growth poster
- **WHEN** a visitor clicks the save/share action on a public swimmer detail
  page after analytics have loaded
- **THEN** the generated poster includes the swimmer header, current event
  summary cards, and the main growth-analysis modules for that selected event

### Requirement: Public swimmer detail pages SHALL maintain consistent vertical section rhythm
The public swimmer detail page MUST keep the hero area, summary metric cards,
and growth-analysis modules separated by a consistent vertical spacing system so
that the page reads as one coordinated public profile.

#### Scenario: Visitor reads a public swimmer detail page
- **WHEN** a visitor views the public swimmer detail page on a loaded state
- **THEN** the hero section, metric-card row, and growth-analysis section are
  separated by visibly consistent vertical spacing instead of collapsing into
  uneven gaps

### Requirement: Public roster filters SHALL drive effective query-backed results
The public swimmer roster SHALL support visible search and team-filter controls
whose displayed results come from backend-recognized query parameters rather
than decorative-only client-side inputs.

#### Scenario: Visitor searches the public roster
- **WHEN** a visitor enters a search term in the public roster search box
- **THEN** the roster request includes that search term and the rendered swimmer
  cards only show matching public swimmers

#### Scenario: Visitor combines search and team filter on the public roster
- **WHEN** a visitor selects a managed team and also enters a search term
- **THEN** the rendered public roster reflects the combined filter result

### Requirement: Public swimmer detail export SHALL capture a full growth poster
The public swimmer detail page MUST export the visible growth page as one long
poster that includes the hero section, summary metrics, and the growth-analysis
modules for the selected event.

#### Scenario: Visitor saves a growth poster
- **WHEN** a visitor clicks the save/share action after the swimmer analytics
  have loaded
- **THEN** the exported image captures the full growth-page container instead of
  only a local card fragment

### Requirement: Public swimmer detail pages SHALL retire the old poster-save action
The public swimmer detail page MUST NOT continue exposing the old
“保存分享海报” behavior once the full-page export flow replaces it.

#### Scenario: Visitor opens a swimmer detail page
- **WHEN** the public swimmer detail page is rendered
- **THEN** the page exposes only the new full-page export action and no longer
  presents the legacy poster-save wording or flow
