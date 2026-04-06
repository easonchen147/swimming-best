## MODIFIED Requirements

### Requirement: Responsive interactions SHALL preserve core workflows
The system SHALL keep core workflows functional across viewport sizes,
including navigation, filtering, chart reading, and form submission, and
chart-heavy pages MUST render without horizontal overflow or unstable empty
containers on phone-sized viewports. The public arena market board SHALL remain
readable on mobile, with tile density and detail content adapting to smaller
screens.

#### Scenario: Visitor opens the arena on mobile
- **WHEN** a visitor opens the public arena page on a phone-sized viewport
- **THEN** the heatmap board and selected arena detail render without horizontal
  overflow and remain tappable and readable
