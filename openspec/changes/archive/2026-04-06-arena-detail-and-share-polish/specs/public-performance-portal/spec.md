## ADDED Requirements

### Requirement: Public swimmer detail pages SHALL support full-growth poster export
The public swimmer detail page MUST provide a save/share export that captures
the swimmer hero, current metric cards, and the visible growth-analysis content
for the selected event, instead of exporting only the top hero block.

#### Scenario: Visitor saves a public swimmer growth poster
- **WHEN** a visitor clicks the save/share action on a public swimmer detail
  page after analytics have loaded
- **THEN** the generated poster includes the swimmer header, current event
  summary cards, and the main growth-analysis modules for that selected event

### Requirement: Public swimmer detail pages SHALL maintain consistent vertical section rhythm
The public swimmer detail page MUST keep the hero area, summary metric cards,
and growth-analysis modules separated by a consistent vertical spacing system so
that the page reads as one coordinated public profile.

#### Scenario: Visitor reads a public swimmer detail page
- **WHEN** a visitor views the public swimmer detail page on a loaded state
- **THEN** the hero section, metric-card row, and growth-analysis section are
  separated by visibly consistent vertical spacing instead of collapsing into
  uneven gaps
