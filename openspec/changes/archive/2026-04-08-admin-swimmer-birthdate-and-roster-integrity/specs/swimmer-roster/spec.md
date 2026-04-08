## MODIFIED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review
swimmer profiles for multiple children. The admin swimmer workflow SHALL accept
an exact birth date while continuing to preserve a compatible birth year for
legacy behavior that still depends on year-based metadata.

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

### Requirement: Swimmer profiles SHALL keep visibility controls reversible
Swimmer visibility and public identity settings SHALL remain fully editable,
including transitions out of a fully hidden state.

#### Scenario: Administrator restores a previously hidden swimmer to public
- **WHEN** an administrator edits a swimmer that was set to `hidden`, changes
  the public-name mode back to a visible mode, and re-enables public visibility
- **THEN** the system persists the swimmer as public again instead of leaving it
  stuck in a hidden state
