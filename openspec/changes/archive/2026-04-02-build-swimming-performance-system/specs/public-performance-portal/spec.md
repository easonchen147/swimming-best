## ADDED Requirements

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that are configured as publicly visible, and public payloads MUST use the swimmer's configured public display identity.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system returns only publicly visible swimmers with safe display fields

#### Scenario: Public swimmer detail is requested
- **WHEN** a visitor requests a public swimmer page for a visible swimmer
- **THEN** the system returns swimmer summary, event summaries, goals eligible for public display, and analytics-safe metadata

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide public compare and share-oriented pages for PB, goal progress, and same-event comparison views.

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor requests a public compare page for one structured event and multiple visible swimmers
- **THEN** the system renders the comparison data for those swimmers and event

#### Scenario: Visitor opens a PB share view
- **WHEN** a visitor opens a share view for a visible swimmer's PB summary
- **THEN** the system renders a simplified share-friendly PB presentation without admin-only controls

