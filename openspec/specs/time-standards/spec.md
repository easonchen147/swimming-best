# time-standards Specification

## Purpose
Describe the legacy custom benchmark subsystem and its reduced role after the
product moves to the built-in national standard as the default benchmark
source.

## Requirements

### Requirement: Custom benchmark management SHALL not be part of the primary admin workflow
The system SHALL not expose custom benchmark management as a default navigation
entry or required operator workflow. Legacy custom benchmark data MAY remain in
storage for compatibility, but the primary experience SHALL rely on the built-in
official standard.

#### Scenario: Administrator opens the main admin navigation
- **WHEN** an administrator browses the primary admin workflows
- **THEN** custom standards management is not presented as a required or primary
  navigation entry

### Requirement: Default analytics SHALL rely on the built-in official standard
The system SHALL use the built-in official baseline as the default benchmark
source in public and admin-facing progress views.

#### Scenario: Event analytics are rendered
- **WHEN** a swimmer event analytics payload or page is requested
- **THEN** the default benchmark guidance comes from the built-in official
  baseline rather than requiring manually maintained custom standards
