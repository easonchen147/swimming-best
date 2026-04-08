## MODIFIED Requirements

### Requirement: Interactive Feedback and States
All interactive elements (buttons, inputs, links, cards) SHALL provide clear,
high-quality visual feedback for all states, including hover, active, focus,
and loading. Feedback MUST be fluid and use subtle transitions to enhance the
feeling of a premium interface. All state changes MUST use defined `motion`
spring or tween transitions for a more organic feel. Shared select controls and
shared picker triggers SHALL visually align with the application's modern
surface styling. Buttons, inputs, selects, cards, badges, tables, dialogs, and
picker triggers SHALL read as one coherent shadcn/ui-style family. Shared
select controls SHALL use the shadcn-style Radix Select pattern with a styled
trigger, overlay content surface, and selectable items rather than a
browser-native select wrapped in custom decoration. Shared primitives SHALL
prefer official shadcn/Radix component semantics at the root level, and
project-level visual customization SHALL only build on top of those correct
primitive semantics. The admin swimmer birth-date control SHALL use the shared
calendar-style picker presentation rather than a raw browser date input.

#### Scenario: User opens the swimmer birth-date picker
- **WHEN** an administrator opens the birth-date control on the swimmer form
- **THEN** the control renders through the shared calendar-style picker surface
  with the same component-family styling as the rest of the application, and
  its empty placeholder reads `请选择`

### Requirement: Modern Data Presentation
Data tables and lists SHALL be upgraded to a modern, clean aesthetic with
improved readability, whitespace management, and subtle row highlights.
Complex data MUST be presented using clear hierarchies and visual aids (e.g.,
status badges, sparklines) where appropriate. Lists of items SHALL animate
their entrance (e.g., staggered fade-in) when the page is loaded.

#### Scenario: Administrator views the swimmer roster table on desktop
- **WHEN** the swimmer roster table is rendered on a desktop viewport
- **THEN** the name, team, status, and action columns remain visually aligned,
  the primary name cell does not redundantly append the team name, and the
  action group omits low-value duplicate download actions
