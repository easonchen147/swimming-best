## ADDED Requirements

### Requirement: Public roster filters SHALL drive effective query-backed results
The public swimmer roster SHALL support visible search and team-filter controls
whose displayed results come from backend-recognized query parameters rather
than decorative-only client-side inputs.

#### Scenario: Visitor searches the public roster
- **WHEN** a visitor enters a search term in the public roster search box
- **THEN** the roster request includes that search term and the rendered swimmer
  cards only show matching public swimmers

#### Scenario: Visitor combines search and team filter on the public roster
- **WHEN** a visitor selects a managed team and also enters a search term
- **THEN** the rendered public roster reflects the combined filter result

### Requirement: Public swimmer detail export SHALL capture a full growth poster
The public swimmer detail page MUST export the visible growth page as one long
poster that includes the hero section, summary metrics, and the growth-analysis
modules for the selected event.

#### Scenario: Visitor saves a growth poster
- **WHEN** a visitor clicks the save/share action after the swimmer analytics
  have loaded
- **THEN** the exported image captures the full growth-page container instead of
  only a local card fragment
