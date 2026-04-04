## MODIFIED Requirements

### Requirement: Public pages SHALL expose benchmark-aware event analytics views
The system SHALL provide public swimmer and event-detail analytics views that
combine progression data, goal progress, and official grade guidance for the
currently selected structured event without requiring login. Public event labels
and benchmark copy SHALL use Chinese project names that distinguish short-course
and long-course events.

#### Scenario: Visitor opens a public swimmer analytics page
- **WHEN** a visitor selects an event on a visible swimmer's public page
- **THEN** the page renders the selected event's growth chart and supporting
  benchmark details using Chinese event names that clearly distinguish pool
  length

#### Scenario: Visitor opens a public compare page
- **WHEN** a visitor views the compare experience
- **THEN** event selections and summary cards distinguish short-course and
  long-course versions of the same stroke and distance
