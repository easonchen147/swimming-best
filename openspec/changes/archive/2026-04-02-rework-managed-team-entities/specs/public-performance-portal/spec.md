## MODIFIED Requirements

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that are
configured as publicly visible, and public payloads MUST use the swimmer's
configured public display identity. Public list, detail, compare, and share
experiences MUST expose the swimmer's assigned managed team wherever team data
is used to distinguish children safely.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system returns only publicly visible swimmers with safe display
  fields and structured managed team data for roster distinction

#### Scenario: Public list is filtered by managed team
- **WHEN** a visitor requests the public swimmer listing with a managed team
  identifier filter
- **THEN** the system returns only visible swimmers assigned to that team

#### Scenario: Public swimmer detail is requested
- **WHEN** a visitor requests a public swimmer page for a visible swimmer
- **THEN** the system returns swimmer summary, event summaries, goals eligible
  for public display, analytics-safe metadata, and the swimmer's managed team

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide public compare pages, share-oriented pages, and
per-event detail views for visible swimmers so visitors can inspect PB, goal
progress, and same-event comparison data without admin controls.

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor requests a public compare page for one structured event and
  multiple visible swimmers
- **THEN** the system renders the comparison data for those swimmers and event,
  including managed team data used to distinguish swimmers

#### Scenario: Visitor opens a public event detail page
- **WHEN** a visitor requests a visible swimmer's event detail page
- **THEN** the system renders event-specific series, PB state, goals, and safe
  swimmer identity details for that event

#### Scenario: Visitor opens a PB share view
- **WHEN** a visitor opens a share view for a visible swimmer's PB summary
- **THEN** the system renders a simplified share-friendly PB presentation without
  admin-only controls and includes the swimmer's managed team where identity
  distinction is shown
