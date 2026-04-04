## ADDED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take administrators to real pages for the corresponding workflow.

#### Scenario: Administrator selects the "record new performance" shortcut
- **WHEN** an administrator activates the dashboard shortcut for recording performances
- **THEN** the UI navigates to the admin records page

#### Scenario: Administrator selects the "bulk import" shortcut
- **WHEN** an administrator activates the dashboard shortcut for CSV import
- **THEN** the UI navigates to the admin import page

## ADDED Requirements

### Requirement: Admin shortcuts SHALL remain usable on mobile layouts
The shortcut area SHALL remain reachable and tappable on phone-sized viewports.

#### Scenario: Mobile administrator opens the dashboard
- **WHEN** the admin dashboard is rendered on a mobile viewport
- **THEN** the shortcut actions remain visible or reachable without horizontal scrolling

