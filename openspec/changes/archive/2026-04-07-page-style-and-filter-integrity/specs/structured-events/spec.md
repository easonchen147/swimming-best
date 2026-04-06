## ADDED Requirements

### Requirement: Structured event directory SHALL support query-backed search
The admin event directory SHALL support a visible search control whose results
are backed by a backend-recognized search parameter.

#### Scenario: Administrator searches events
- **WHEN** an administrator enters a display-name fragment in the event catalog
  search box
- **THEN** the event list request includes that search value and the rendered
  event cards only show matching events
