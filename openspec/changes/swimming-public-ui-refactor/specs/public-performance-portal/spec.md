## MODIFIED Requirements

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that are
configured as publicly visible, and public payloads MUST use the swimmer's
configured public display identity. The public home page SHALL display all visible swimmers in a full-width responsive table with team-based tab switching, without metric cards, comparison links, or informational sidebars. The page header SHALL use a clean, professional design without hero sections.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system renders a full-width table of all publicly visible swimmers with columns for display name, team, and a link to view their profile, with team tabs for filtering

#### Scenario: Public list is filtered by managed team
- **WHEN** a visitor selects a team tab on the public swimmer listing
- **THEN** the table filters to show only visible swimmers assigned to that team

#### Scenario: Public swimmer detail is requested
- **WHEN** a visitor requests a public swimmer page for a visible swimmer
- **THEN** the system returns swimmer summary, event summaries, goals eligible
  for public display, analytics-safe metadata, and the swimmer's managed team

## MODIFIED Requirements

### Requirement: Public pages SHALL support share and event detail views
The system SHALL provide share-oriented pages and per-event detail views for visible swimmers so visitors can inspect PB, goal progress, and performance history without admin controls. The multi-swimmer comparison page and all comparison-related UI elements SHALL be removed.

#### Scenario: Visitor opens a public event detail page
- **WHEN** a visitor requests a visible swimmer's event detail page
- **THEN** the system renders event-specific improvement bars, PB markers, goal gauges, source-type-annotated timeline, and safe swimmer identity details

#### Scenario: Visitor opens a PB share view
- **WHEN** a visitor opens a share view for a visible swimmer's PB summary
- **THEN** the system renders a simplified share-friendly PB presentation without
  admin-only controls and includes the swimmer's managed team where identity
  distinction is shown

## REMOVED Requirements

### Requirement: Public pages SHALL support compare and share views
**Reason**: Multi-swimmer comparison feature removed per user decision — self-comparison via PB tracking is sufficient.
**Migration**: The `/compare` route SHALL redirect to the home page. Compare-related components (`CompareChart`, comparison API calls) SHALL be deleted.
