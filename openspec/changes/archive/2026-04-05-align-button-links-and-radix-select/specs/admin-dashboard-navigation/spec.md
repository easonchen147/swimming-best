## MODIFIED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take
administrators to real pages or modal workflows for the corresponding task.
Quick record SHALL appear inside the dashboard's quick-action area instead of
the top header, and goal creation SHALL also be surfaced as a quick action. The
quick-actions area SHALL clearly communicate what the quick-record action does
and which keyboard shortcut triggers it, while the header SHALL not duplicate
that shortcut hint. Dashboard quick actions and surrounding surfaces SHALL use
the shared component layer consistently, and all shortcut links rendered as
buttons SHALL attach their button styling to the actual interactive root node
rather than to a nested wrapper span.

#### Scenario: Administrator activates the quick-record action
- **WHEN** an administrator selects the quick-record action from the dashboard
  quick-action area
- **THEN** the UI opens the quick-record workflow without requiring a separate
  page transition and visibly communicates the quick-record shortcut within the
  quick-actions area

#### Scenario: Administrator opens the dashboard header
- **WHEN** the admin dashboard header is rendered
- **THEN** the public-page action and logout action both appear as matched
  pill-style buttons with button styling applied to the actual clickable root
  element

#### Scenario: Administrator activates the goal action
- **WHEN** an administrator selects the goal quick action
- **THEN** the UI navigates to the admin goals page
