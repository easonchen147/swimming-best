## MODIFIED Requirements

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that are configured as publicly visible, and public payloads MUST use the swimmer's configured public display identity. The public roster SHALL be presented in an interactive card grid with hover effects and staggered entrance animations.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system renders a public roster of visible swimmers as an interactive card grid including display name, team, and profile link, using a staggered fade-in animation.

### Requirement: Public pages SHALL expose benchmark-aware event analytics views
The system SHALL provide public swimmer and event-detail analytics views that combine progression data, goal progress, and official grade guidance for the currently selected structured event without requiring login. Analytics charts SHALL be interactive and provide visual feedback for benchmark comparisons.

#### Scenario: Visitor opens a public swimmer analytics page
- **WHEN** a visitor selects an event on a visible swimmer's public page
- **THEN** the page renders the selected event's growth chart with an entry animation, benchmark gap summary with visual indicators, and supporting public goal or official grade details.

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide public compare and share-oriented pages for PB, goal progress, and same-event comparison views, and the frontend SHALL expose a usable compare page that consumes the compare API directly. Comparison views SHALL use interactive legends to toggle swimmer data visibility.

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor requests a public compare page for one structured event and multiple visible swimmers
- **THEN** the system renders comparison data for those swimmers and event through a dedicated compare UI that features interactive chart legends and animated data transitions when swimmers are toggled.
