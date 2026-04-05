## MODIFIED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take
administrators to real pages or modal workflows for the corresponding task.
Quick record SHALL appear inside the dashboard's quick-action area instead of
the top header, and goal creation SHALL also be surfaced as a quick action. The
quick-actions area SHALL clearly communicate what the quick-record action does
and which keyboard shortcut triggers it, while the header SHALL not duplicate
that shortcut hint. Dashboard quick actions and surrounding surfaces SHALL use
the shared component layer consistently, and the quick-actions panel SHALL use
the same light-surface card semantics as the rest of the admin overview instead
of a visually isolated dark promo panel.

#### Scenario: Administrator activates the quick-record action
- **WHEN** an administrator selects the quick-record action from the dashboard
  quick-action area
- **THEN** the UI opens the quick-record workflow without requiring a separate
  page transition and visibly communicates the quick-record shortcut within the
  quick-actions area

#### Scenario: Administrator opens the dashboard header
- **WHEN** the admin dashboard header is rendered
- **THEN** the header does not repeat a standalone `Ctrl / Cmd + K` shortcut
  hint, presents the public-page action as a full button, and also exposes a
  sibling logout button with the same shared action treatment

#### Scenario: Administrator activates the goal action
- **WHEN** an administrator selects the goal quick action
- **THEN** the UI navigates to the admin goals page

## ADDED Requirements

### Requirement: Admin navigation chrome SHALL expose complete icon-backed navigation
The admin sidebar SHALL render every primary navigation item with an icon from
the shared icon set. Active navigation items SHALL keep white text and white
iconography on the highlighted background so the current location remains
legible in desktop and mobile menus.

#### Scenario: Administrator scans the sidebar
- **WHEN** the admin sidebar is rendered
- **THEN** every primary navigation entry shows both its label and an icon with
  consistent spacing

#### Scenario: Administrator views the current active page
- **WHEN** the current route matches one of the admin navigation items
- **THEN** that item displays a highlighted background with white label text and
  white icon contrast
