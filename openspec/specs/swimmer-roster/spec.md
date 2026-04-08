# swimmer-roster Specification

## Purpose
Define the managed swimmer roster, including visibility settings, team assignment, and operator-facing profile metadata.

## Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review
swimmer profiles for multiple children. The admin swimmer workflow SHALL accept
an exact birth date while continuing to preserve a compatible birth year for
legacy behavior that still depends on year-based metadata.

#### Scenario: Administrator creates a swimmer with a managed team assignment
- **WHEN** an administrator submits a valid swimmer profile with a team identifier
- **THEN** the system stores the profile and associates it with the selected team

#### Scenario: Administrator updates a swimmer team assignment
- **WHEN** an administrator edits a swimmer and selects a different team
- **THEN** the system reflects the updated team assignment

#### Scenario: Administrator creates a swimmer with extended roster metadata
- **WHEN** an administrator submits a swimmer profile that includes supported roster metadata such as gender or notes
- **THEN** the system stores and returns those fields through the admin API

#### Scenario: Administrator saves a swimmer with an exact birth date
- **WHEN** an administrator submits a swimmer profile with a valid `birthDate`
- **THEN** the system stores that exact birth date and also maintains the
  matching compatible `birthYear`

#### Scenario: Historical swimmer data upgrades without an exact birth date
- **WHEN** the application upgrades an older database that only contains
  `birth_year`
- **THEN** the system adds the new exact-date storage without fabricating month
  or day values, and the historical swimmers remain editable with their
  existing compatible birth year preserved

### Requirement: Swimmer profiles SHALL control public identity and visibility
Each swimmer profile SHALL support visibility controls and identity display modes.

#### Scenario: Public page requests a nickname-mode swimmer with a managed team
- **WHEN** a swimmer is public, nickname-mode, and assigned a team
- **THEN** public payloads display the nickname and team while preserving the configured visibility mode

### Requirement: Swimmer profiles SHALL keep visibility controls reversible
Swimmer visibility and public identity settings SHALL remain fully editable,
including transitions out of a fully hidden state.

#### Scenario: Administrator restores a previously hidden swimmer to public
- **WHEN** an administrator edits a swimmer that was set to `hidden`, changes
  the public-name mode back to a visible mode, and re-enables public visibility
- **THEN** the system persists the swimmer as public again instead of leaving it
  stuck in a hidden state

### Requirement: Swimmer roster filters SHALL use backend-recognized query inputs
The admin swimmer roster SHALL support visible search and team filters whose
results are driven by backend-recognized query parameters instead of local-only
filtering.

#### Scenario: Administrator searches swimmers
- **WHEN** an administrator enters a name or nickname fragment in the swimmer
  roster search box
- **THEN** the roster request includes that search term and only matching
  swimmers are rendered

#### Scenario: Administrator filters swimmers by team and search
- **WHEN** an administrator selects one team and also enters a search term
- **THEN** the roster request combines both conditions and the rendered table
  reflects the combined filtered result
