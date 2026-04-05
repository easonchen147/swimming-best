# uiux-modernization Specification

## Purpose
Define the global frontend design language so admin and public interfaces share
consistent spacing, typography, motion, and state feedback across the product.

## Requirements

### Requirement: Global Design Language
The system SHALL implement a unified, modern design language across all
frontend interfaces, strictly adhering to `frontend-design` and
`frontend-skill` standards. This includes consistent typography, a refined
color palette with depth (shadows/glassmorphism), and a grid-based layout for
all management and public views. All pages SHALL use a standard layout wrapper
that provides smooth exit and entry transitions when navigating. The shared
component layer SHALL follow a shadcn/ui-style component language while
preserving the product's existing color palette. Periodic UI audits SHALL
differentiate between true primitive-usage drift and acceptable project-level
visual customization built on top of correct shadcn/Radix semantics.

#### Scenario: User navigates between different pages
- **WHEN** a user moves from the admin dashboard to the swimmer roster
- **THEN** the visual elements (buttons, cards, headers, spacing) remain
  consistent in style and feel AND the outgoing page fades out while the
  incoming page slides or fades in smoothly

#### Scenario: Team audits shared UI primitives
- **WHEN** maintainers review the shared UI component layer
- **THEN** they treat incorrect primitive root semantics as defects, but do not
  classify project-specific visual theming on top of correct primitives as a
  shadcn migration gap

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
primitive semantics.

#### Scenario: User hovers over a primary action button
- **WHEN** a user moves their cursor over a "Create Swimmer" button
- **THEN** the button exhibits a smooth transition in color, scale, or shadow
  to indicate interactivity using a `motion` transition

#### Scenario: User opens a select or picker control
- **WHEN** a user focuses or opens a shared select field or shared date/year
  picker
- **THEN** the control matches the application's modern card and input styling
  rather than appearing as an out-of-place browser-default control

#### Scenario: User opens a shared select menu
- **WHEN** a user opens any shared select control in the frontend
- **THEN** the menu is rendered through the shared Radix Select overlay
  structure with a styled trigger, content surface, and selectable items

#### Scenario: Shared label and badge primitives are rendered
- **WHEN** a page renders the shared `Label` or `Badge` primitive
- **THEN** those primitives use the official shadcn-style root semantics rather
  than falling back to plain HTML wrappers that bypass the intended primitive
  implementation

### Requirement: Modern Data Presentation
Data tables and lists SHALL be upgraded to a modern, clean aesthetic with
improved readability, whitespace management, and subtle row highlights.
Complex data MUST be presented using clear hierarchies and visual aids (e.g.,
status badges, sparklines) where appropriate. Lists of items SHALL animate
their entrance (e.g., staggered fade-in) when the page is loaded.

#### Scenario: Administrator views the swimmer roster table
- **WHEN** the swimmer roster table is rendered
- **THEN** it uses refined typography, consistent cell padding, and subtle
  borders or zebra-striping to provide a modern, organized look AND the rows
  SHALL appear with a staggered entrance animation
