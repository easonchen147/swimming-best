## MODIFIED Requirements

### Requirement: Responsive interactions SHALL preserve core workflows
The system SHALL keep core workflows functional across viewport sizes,
including navigation, filtering, chart reading, and form submission, and
chart-heavy pages MUST render without horizontal overflow or unstable empty
containers on phone-sized viewports. Public analytics pages with benchmark-rich
growth views SHALL keep chart legends, gap summaries, and action buttons
readable and tappable on phone-sized viewports.

#### Scenario: Visitor reads analytics on mobile
- **WHEN** a visitor views chart-heavy analytics pages on a phone-sized viewport
- **THEN** charts, benchmark summaries, and supporting controls render inside
  stable visible containers and the page does not require horizontal scrolling

#### Scenario: Administrator uses navigation shortcuts on mobile
- **WHEN** an administrator opens the dashboard on a phone-sized viewport
- **THEN** the shortcut navigation remains tappable and routes to the intended page
