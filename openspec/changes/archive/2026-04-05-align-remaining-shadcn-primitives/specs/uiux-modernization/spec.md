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
primitives SHALL prefer official shadcn/Radix component semantics at the root
level, and project-level visual customization SHALL only build on top of those
correct primitive semantics.

#### Scenario: User hovers over a primary action button
- **WHEN** a user moves their cursor over a "Create Swimmer" button
- **THEN** the button exhibits a smooth transition in color, scale, or shadow
  to indicate interactivity using a `motion` transition

#### Scenario: User opens a select or picker control
- **WHEN** a user focuses or opens a shared select field or shared date/year
  picker
- **THEN** the control matches the application's modern card and input styling
  rather than appearing as an out-of-place browser-default control

#### Scenario: Shared label and badge primitives are rendered
- **WHEN** a page renders the shared `Label` or `Badge` primitive
- **THEN** those primitives use the official shadcn-style root semantics rather
  than falling back to plain HTML wrappers that bypass the intended primitive
  implementation
