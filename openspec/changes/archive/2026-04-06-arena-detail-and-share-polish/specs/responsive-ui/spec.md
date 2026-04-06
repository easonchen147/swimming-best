## MODIFIED Requirements

### Requirement: Responsive interactions SHALL preserve core workflows
The system SHALL keep core workflows functional across viewport sizes,
including navigation, filtering, chart reading, and form submission, and
chart-heavy pages MUST render without horizontal overflow or unstable empty
containers on phone-sized viewports. Charts on mobile SHALL include
interactive touch tooltips and simplified legends. Selection-driven pages SHALL
distinguish empty states from loading states so that users do not see false
loading feedback before required inputs are chosen. Public arena pages SHALL
keep the race-group selector and primary race-detail surface readable and
tappable on phone-sized viewports. Public swimmer detail pages SHALL preserve a
stable section rhythm and export-ready content grouping on mobile and desktop.

#### Scenario: Visitor reads analytics on mobile
- **WHEN** a visitor views chart-heavy analytics pages on a phone-sized viewport
- **THEN** charts, benchmark summaries, and supporting controls render inside
  stable visible containers that adapt their height and width to the screen,
  with touch-responsive interaction points

#### Scenario: Administrator uses navigation shortcuts on mobile
- **WHEN** an administrator opens the dashboard on a phone-sized viewport
- **THEN** the shortcut navigation remains tappable and routes to the intended
  page

#### Scenario: Visitor opens compare before completing selections
- **WHEN** a visitor opens the compare page without selecting at least two
  swimmers and one event
- **THEN** the page shows a stable explanatory empty state instead of a loading
  placeholder

#### Scenario: Visitor opens the arena on mobile
- **WHEN** a visitor opens the public arena page on a phone-sized viewport
- **THEN** the race-group selector and selected race detail render without
  horizontal overflow and remain tappable and readable

#### Scenario: Visitor opens a public swimmer detail page on mobile
- **WHEN** a visitor opens a public swimmer detail page on a phone-sized viewport
- **THEN** the hero section, metric summary cards, and growth-analysis sections
  remain stacked with consistent spacing and stay inside the exportable content
  flow without clipping or overlap
