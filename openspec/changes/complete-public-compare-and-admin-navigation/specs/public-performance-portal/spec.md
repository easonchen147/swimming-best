## MODIFIED Requirements

### Requirement: Public pages SHALL support compare and share views
The system SHALL provide public compare and share-oriented pages for PB, goal progress, and same-event comparison views, and the frontend SHALL expose a usable compare page that consumes the compare API directly.

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor requests a public compare page for one structured event and multiple visible swimmers
- **THEN** the system renders comparison data for those swimmers and event through a dedicated compare UI

#### Scenario: Visitor reaches compare from the public frontend
- **WHEN** a visitor navigates to the public compare experience from the frontend
- **THEN** the page lets the visitor select visible swimmers and a shared event without requiring login

