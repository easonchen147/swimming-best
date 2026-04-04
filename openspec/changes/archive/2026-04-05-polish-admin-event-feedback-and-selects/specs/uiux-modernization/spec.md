## MODIFIED Requirements

### Requirement: Interactive Feedback and States
All interactive elements (buttons, inputs, links, cards) SHALL provide clear,
high-quality visual feedback for all states, including hover, active, focus,
and loading. Feedback MUST be fluid and use subtle transitions to enhance the
feeling of a premium interface. All state changes MUST use defined `motion`
spring or tween transitions for a more organic feel. Shared select controls
SHALL visually align with the application's modern card and input styling.

#### Scenario: User hovers over a primary action button
- **WHEN** a user moves their cursor over a "Create Swimmer" button
- **THEN** the button exhibits a smooth transition in color, scale, or shadow
  to indicate interactivity using a `motion` transition

#### Scenario: User opens a select control
- **WHEN** a user focuses or opens a shared select field
- **THEN** the control matches the application's modern surface styling rather
  than appearing as an out-of-place browser-default dropdown
