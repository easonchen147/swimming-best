## ADDED Requirements

### Requirement: Managed team directory SHALL support query-backed search
The admin team directory SHALL support a visible search control whose results
are backed by a backend-recognized search parameter.

#### Scenario: Administrator searches managed teams
- **WHEN** an administrator enters a team name fragment in the team-directory
  search box
- **THEN** the admin team request includes that search value and the rendered
  team cards only show matching teams
