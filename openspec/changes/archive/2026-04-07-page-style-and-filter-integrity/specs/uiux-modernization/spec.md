## ADDED Requirements

### Requirement: Shared boolean and select controls SHALL use unified Radix semantics
High-traffic admin and public forms SHALL use shared Radix/shadcn primitives for
boolean and select controls, and manual Select menus MUST preserve proper
grouped item composition.

#### Scenario: Administrator opens a form with a boolean toggle
- **WHEN** an administrator views a form that previously used a native checkbox
- **THEN** the rendered control uses the shared themed checkbox primitive rather
  than a browser-default checkbox

#### Scenario: User opens a manual select menu
- **WHEN** a page renders a manually composed shared select menu
- **THEN** its selectable items are grouped within the shared Radix select
  structure rather than bypassing the grouped item composition
