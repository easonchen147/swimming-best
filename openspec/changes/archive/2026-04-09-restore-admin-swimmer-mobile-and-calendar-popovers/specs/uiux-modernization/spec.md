## ADDED Requirements

### Requirement: Shared date pickers SHALL use the unified calendar popover surface
The admin-facing shared date picker surfaces SHALL render through the shared
calendar and popover primitives so their overlays match the product’s current
shadcn/Radix visual language.

#### Scenario: Administrator opens any shared date picker
- **WHEN** an admin page opens a shared date picker overlay
- **THEN** the calendar surface matches the application’s shared popover/card
  styling rather than appearing visually out of place
