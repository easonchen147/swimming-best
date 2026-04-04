## MODIFIED Requirements

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that
are configured as publicly visible, and public payloads MUST use the swimmer's
configured public display identity. The public pages SHALL use the shared
component layer rather than mixed raw page-level controls.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system renders the public roster and surrounding controls using
  the same shared component language as the rest of the frontend

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide public compare and share-oriented pages for PB, goal
progress, and same-event comparison views, and the frontend SHALL expose a
usable compare page that consumes the compare API directly. These views SHALL
also use the shared component layer consistently across filters, action
buttons, and summary surfaces.

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor requests a public compare page
- **THEN** the compare controls and result surfaces are rendered through the
  same shared component family used elsewhere in the app
