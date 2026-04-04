# streamlined-admin-workflows Specification

## Purpose
Define the UI behaviors that make admin entry flows faster, more keyboard
friendly, and more forgiving during rapid data capture.

## Requirements

### Requirement: Quick Performance Record Overlay
The admin interface SHALL provide a "Quick Record" button or hotkey that opens
a modal or drawer from any page, allowing rapid performance entry without
losing current context.

#### Scenario: Opening quick record modal
- **WHEN** the admin clicks the "Quick Record" button from the swimmer list
- **THEN** a modal SHALL appear containing event, swimmer, date, and time
  inputs

### Requirement: Keyboard-Driven Entry
Admin forms SHALL support standard keyboard navigation (Tab, Enter) and
shorthand inputs (e.g., `1:05.23` as `10523`) for maximum efficiency.

#### Scenario: Recording with shorthand
- **WHEN** the admin enters `10523` into a time field and presses Enter
- **THEN** the system SHALL parse and display it as `1:05.23` and move focus to
  the next field

### Requirement: Real-time Validation Feedback
Form fields SHALL provide immediate visual feedback (e.g., color, icons,
micro-copy) on entry validity (e.g., proper time format) without requiring
submission.

#### Scenario: Invalid time format entry
- **WHEN** the admin enters `99:99` in a performance time field
- **THEN** the input SHALL show a visual error state and a descriptive message
