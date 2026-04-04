## Requirements

### Requirement: Admin time input SHALL support seconds and milliseconds modes
The admin performance recording form SHALL provide a unit toggle allowing the
user to enter time values in either seconds (with decimal precision) or raw
milliseconds. The system SHALL convert seconds input to milliseconds before
submission.

#### Scenario: User enters time in seconds mode
- **WHEN** the admin selects seconds mode and enters `35.11`
- **THEN** the system converts the value to `35110` milliseconds before
  submitting to the API
