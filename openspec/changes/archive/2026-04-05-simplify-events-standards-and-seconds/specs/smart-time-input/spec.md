## MODIFIED Requirements

### Requirement: Admin time input SHALL support seconds-first values with shorthand parsing
The admin performance and goal forms SHALL accept time values in seconds with
decimal precision as the default user-facing unit. The input SHALL support
compact shorthand entry such as `10523` and normalize it to `1:05.23` without
requiring a separate milliseconds mode.

#### Scenario: User enters time in seconds mode
- **WHEN** the admin enters `35.11`
- **THEN** the system preserves the value as `35.11` seconds in the user-facing
  flow and submits the result through the seconds-based contract

#### Scenario: User enters shorthand time
- **WHEN** the admin enters `10523`
- **THEN** the system parses and displays it as `1:05.23`

#### Scenario: Invalid seconds input
- **WHEN** the admin enters an invalid time such as `99:99`
- **THEN** the input shows a descriptive validation message without requiring
  form submission
