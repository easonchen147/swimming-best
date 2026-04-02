## ADDED Requirements

### Requirement: Primary pages SHALL support desktop and mobile layouts
The system SHALL render all primary admin and public pages in layouts that remain usable on desktop browsers and mobile phone browsers.

#### Scenario: Visitor opens a public page on a mobile device
- **WHEN** a public swimmer or compare page is rendered on a phone-sized viewport
- **THEN** the page stacks content vertically, preserves readable text, and keeps primary actions reachable without horizontal scrolling

#### Scenario: Administrator opens a management page on a desktop browser
- **WHEN** an admin dashboard or management page is rendered on a desktop-sized viewport
- **THEN** the page presents dense navigation, summary cards, forms, and data views optimized for large screens

### Requirement: Responsive interactions SHALL preserve core workflows
The system SHALL keep core workflows functional across viewport sizes, including navigation, filtering, chart reading, and form submission.

#### Scenario: Administrator uses result entry on mobile
- **WHEN** an administrator opens a quick entry or context entry flow on a phone-sized viewport
- **THEN** the form remains operable with touch targets, clear sectioning, and accessible submission controls

#### Scenario: Visitor reads analytics on mobile
- **WHEN** a visitor views charts on a phone-sized viewport
- **THEN** the page adapts chart labels, spacing, and supporting summaries so the progression can still be understood

