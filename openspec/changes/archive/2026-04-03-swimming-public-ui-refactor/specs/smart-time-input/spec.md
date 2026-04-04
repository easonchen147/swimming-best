## ADDED Requirements

### Requirement: Admin time input SHALL support seconds and milliseconds modes
The admin performance recording form SHALL provide a unit toggle allowing the user to enter time values in either seconds (with decimal precision) or raw milliseconds. The system SHALL convert seconds input to milliseconds before submission using `Math.round(parseFloat(value) * 1000)`.

#### Scenario: User enters time in seconds mode
- **WHEN** the admin selects "秒" mode and enters `35.11` in the time field
- **THEN** the system converts the value to `35110` milliseconds before submitting to the API

#### Scenario: User enters time in milliseconds mode
- **WHEN** the admin selects "毫秒" mode and enters `35110` in the time field
- **THEN** the system submits `35110` as the raw millisecond value without conversion

#### Scenario: Unit toggle preserves converted value
- **WHEN** the admin switches from seconds mode (showing `35.11`) to milliseconds mode
- **THEN** the input field updates to show `35110` (the converted value)

#### Scenario: Invalid seconds input
- **WHEN** the admin enters a non-numeric value in seconds mode
- **THEN** the form validation prevents submission and shows an error
