## MODIFIED Requirements

### Requirement: Primary pages SHALL support desktop and mobile layouts
The system SHALL render all primary admin and public pages in layouts that
remain usable on desktop browsers and mobile phone browsers. Layout
transitions between viewports SHALL be fluid using responsive design
principles and `motion` layout adjustments. The shared component layer SHALL
remain responsive on both viewport classes, and primary action groups in page
headers or dashboard action areas SHALL wrap or reflow without hiding key
actions.

#### Scenario: Visitor opens a public page on a mobile device
- **WHEN** a public swimmer, compare, event-detail, or share page is rendered
  on a phone-sized viewport
- **THEN** the page stacks content vertically, preserves readable text, keeps
  primary actions reachable with touch-optimized targets, and keeps header
  navigation buttons visible in a compact responsive arrangement

#### Scenario: Administrator opens a management page on a desktop browser
- **WHEN** an admin dashboard or management page is rendered on a desktop-sized
  viewport
- **THEN** the page presents dense navigation, summary cards, forms, and data
  views optimized for large screens without breaking the shared component
  states

## MODIFIED Requirements

### Requirement: Responsive interactions SHALL preserve core workflows
The system SHALL keep core workflows functional across viewport sizes,
including navigation, filtering, chart reading, and form submission, and
chart-heavy pages MUST render without horizontal overflow or unstable empty
containers on phone-sized viewports. Charts on mobile SHALL include
interactive touch tooltips and simplified legends. Selection-driven pages SHALL
distinguish empty states from loading states so that users do not see false
loading feedback before required inputs are chosen.

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
