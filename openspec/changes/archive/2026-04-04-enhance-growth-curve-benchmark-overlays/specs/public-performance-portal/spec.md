## ADDED Requirements

### Requirement: Public event analytics views SHALL expose benchmark-aware growth guidance
The system SHALL provide public swimmer and event-detail analytics views that
combine progression data, goal progress, and official grade guidance for the
currently selected structured event without requiring login.

#### Scenario: Visitor opens a public swimmer analytics page
- **WHEN** a visitor selects an event on a visible swimmer's public page
- **THEN** the page renders the selected event's growth chart, benchmark gap
  summary, and supporting public goal or official grade details

#### Scenario: Visitor opens a public event detail page
- **WHEN** a visitor opens the dedicated public event detail route for a visible
  swimmer
- **THEN** the page renders the same benchmark-aware growth guidance for that
  exact event and swimmer combination
