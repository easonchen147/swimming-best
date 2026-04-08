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
primitive semantics. Shared date pickers in admin workflows SHALL use a clean
single-surface popover structure rather than visually stacking multiple card
layers inside the same picker.

#### Scenario: User opens an admin date picker
- **WHEN** an administrator opens a shared date picker from the swimmer,
  record, goal, or quick-record workflows
- **THEN** the popover appears as one coherent surface that matches the shared
  theme without looking like multiple overlapping components

### Requirement: Modern Data Presentation
Data tables and lists SHALL be upgraded to a modern, clean aesthetic with
improved readability, whitespace management, and subtle row highlights.
Complex data MUST be presented using clear hierarchies and visual aids (e.g.,
status badges, sparklines) where appropriate. Lists of items SHALL animate
their entrance (e.g., staggered fade-in) when the page is loaded. Desktop admin
roster tables SHALL prefer balanced column density over unnecessary horizontal
scroll.

#### Scenario: Administrator views the swimmer roster table on desktop
- **WHEN** the swimmer roster table is rendered on a desktop viewport
- **THEN** the column density remains balanced enough that the primary roster
  view does not introduce unnecessary horizontal scrolling for standard content
