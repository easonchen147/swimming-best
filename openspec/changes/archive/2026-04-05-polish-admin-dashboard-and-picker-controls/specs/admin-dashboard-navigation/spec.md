## MODIFIED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take
administrators to real pages or modal workflows for the corresponding task.
Quick record SHALL appear inside the dashboard's quick-action area instead of
the top header, and goal creation SHALL also be surfaced as a quick action. The
quick-actions area SHALL clearly communicate what the quick-record action does
and which keyboard shortcut triggers it, while the header SHALL not duplicate
that shortcut hint.

#### Scenario: Administrator activates the quick-record action
- **WHEN** an administrator selects the quick-record action from the dashboard
  quick-action area
- **THEN** the UI opens the quick-record workflow and visibly communicates the
  quick-record shortcut affordance within the quick-actions area

#### Scenario: Administrator opens the dashboard header
- **WHEN** the admin dashboard header is rendered
- **THEN** the header does not repeat a standalone `Ctrl / Cmd + K` shortcut
  hint and the public-page action is presented as a full button rather than a
  text-style link

### Requirement: Dashboard guidance SHALL present a visual management flow
The admin dashboard SHALL present the recommended management sequence as a
flowchart-style process instead of a flat list of independent cards.

#### Scenario: Administrator reads the recommended flow
- **WHEN** an administrator opens the dashboard guidance area
- **THEN** the steps are visually connected in sequence so the operator can
  understand the order of operations at a glance
