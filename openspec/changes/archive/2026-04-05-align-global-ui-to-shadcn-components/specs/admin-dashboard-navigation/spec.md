## MODIFIED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take
administrators to real pages or modal workflows for the corresponding task.
These shortcuts and their surrounding surfaces SHALL use the shared
shadcn/ui-style component layer consistently instead of mixing custom cards,
raw buttons, and ad-hoc controls.

#### Scenario: Administrator opens the dashboard
- **WHEN** an administrator views the dashboard quick-action area
- **THEN** the shortcuts are rendered through the same shared component family
  used across the rest of the frontend
