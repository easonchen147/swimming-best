## ADDED Requirements

### Requirement: Swimmer roster filters SHALL use backend-recognized query inputs
The admin swimmer roster SHALL support visible search and team filters whose
results are driven by backend-recognized query parameters instead of local-only
filtering.

#### Scenario: Administrator searches swimmers
- **WHEN** an administrator enters a name or nickname fragment in the swimmer
  roster search box
- **THEN** the roster request includes that search term and only matching
  swimmers are rendered

#### Scenario: Administrator filters swimmers by team and search
- **WHEN** an administrator selects one team and also enters a search term
- **THEN** the roster request combines both conditions and the rendered table
  reflects the combined filtered result
