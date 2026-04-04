## MODIFIED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take
administrators to real pages or modal workflows for the corresponding task.
Quick record SHALL appear inside the dashboard's quick-action area instead of
the top header, and goal creation SHALL also be surfaced as a quick action. The
quick-actions area SHALL clearly communicate what the quick-record action does
and which keyboard shortcut triggers it.

#### Scenario: Administrator activates the quick-record action
- **WHEN** an administrator selects the quick-record action from the dashboard
  quick-action area
- **THEN** the UI opens the quick-record workflow and visibly communicates that
  the action records a result, including its keyboard shortcut affordance

#### Scenario: Administrator activates the goal action
- **WHEN** an administrator selects the goal quick action
- **THEN** the UI navigates to the admin goals page
