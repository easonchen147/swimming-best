## MODIFIED Requirements

### Requirement: Admin dashboard shortcut actions SHALL navigate to working management pages
The admin dashboard SHALL expose actionable shortcut entries that take
administrators to real pages or modal workflows for the corresponding task.
Quick record SHALL appear inside the dashboard's quick-action area instead of
the top header, and goal creation SHALL also be surfaced as a quick action. The
quick-actions area SHALL clearly communicate what the quick-record action does
and which keyboard shortcut triggers it, while the header SHALL not duplicate
that shortcut hint. Dashboard quick actions and surrounding surfaces SHALL use
the shared shadcn/ui-style component layer consistently, and the quick-actions
panel SHALL use the same light-surface card semantics as the rest of the admin
overview. The three quick-action entries SHALL share one identical layout
template with consistent left alignment for icon, text block, and affordance
arrow.

#### Scenario: Administrator activates the quick-record action
- **WHEN** an administrator selects the quick-record action from the dashboard
  quick-action area
- **THEN** the UI opens the quick-record workflow without requiring a separate
  page transition and visibly communicates the quick-record shortcut within the
  quick-actions area

#### Scenario: Administrator opens the dashboard header
- **WHEN** the admin dashboard header is rendered
- **THEN** the public-page action and logout action use the same font sizing,
  weight, spacing, and button chrome, differing only by restrained semantic
  color treatment

#### Scenario: Administrator scans the quick-action area
- **WHEN** the admin dashboard quick-action panel is rendered
- **THEN** all three shortcut entries share the same left-aligned composition
  and appear as one coherent button family
