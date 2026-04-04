# swimmer-roster Specification

## Purpose
Define the managed swimmer roster, including visibility settings, team assignment, and operator-facing profile metadata.

## Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review
swimmer profiles for multiple children. Birth year entry SHALL use a bounded
year-selection control rather than unconstrained free-text entry.

#### Scenario: Administrator creates a swimmer with a managed team assignment
- **WHEN** an administrator submits a valid swimmer profile with a team identifier
- **THEN** the system stores the profile and associates it with the selected team

#### Scenario: Administrator updates a swimmer team assignment
- **WHEN** an administrator edits a swimmer and selects a different team
- **THEN** the system reflects the updated team assignment

#### Scenario: Administrator creates a swimmer with extended roster metadata
- **WHEN** an administrator submits a swimmer profile that includes supported roster metadata such as gender or notes
- **THEN** the system stores and returns those fields through the admin API

#### Scenario: Administrator selects a birth year
- **WHEN** an administrator edits the birth-year field in the swimmer form
- **THEN** the UI offers a bounded year-selection control instead of requiring
  free-text typing

### Requirement: Swimmer profiles SHALL control public identity and visibility
Each swimmer profile SHALL support visibility controls and identity display modes.

#### Scenario: Public page requests a nickname-mode swimmer with a managed team
- **WHEN** a swimmer is public, nickname-mode, and assigned a team
- **THEN** public payloads display the nickname and team while preserving the configured visibility mode
