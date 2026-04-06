## ADDED Requirements

### Requirement: Public growth pages SHALL preserve consistent vertical rhythm
The public swimmer detail page MUST keep its hero block, metric row, and
growth-analysis modules separated by a consistent vertical spacing system across
desktop and mobile layouts.

#### Scenario: Visitor opens a swimmer detail page
- **WHEN** a visitor views a loaded public swimmer detail page
- **THEN** the major rows of content use consistent vertical spacing rather than
  visibly different gaps between earlier and later sections

#### Scenario: Visitor exports a long growth poster on mobile
- **WHEN** a visitor uses the share export on a phone-sized viewport
- **THEN** the exportable content container remains vertically coherent and does
  not clip or overlap its stacked sections
