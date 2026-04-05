## MODIFIED Requirements

### Requirement: Public primary navigation SHALL present top-level destinations as buttons
The public header SHALL render the top-level destinations for home, compare,
and admin entry as full buttons built from the shared action component layer.
Each button SHALL remain visually distinguishable from the others while
preserving the current site color system, and the visible button styling SHALL
be attached to the real navigation link root instead of a nested wrapper.

#### Scenario: Visitor opens the public header on desktop
- **WHEN** a visitor loads a public page on a desktop viewport
- **THEN** the header shows button-style navigation for home, compare, and
  admin entry instead of text-like links

#### Scenario: Visitor opens the public header on mobile
- **WHEN** a visitor loads a public page on a phone-sized viewport
- **THEN** the same three destinations remain visible as tappable buttons in a
  compact layout without losing their visual distinction
