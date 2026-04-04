## MODIFIED Requirements

### Requirement: Events SHALL be defined with structured performance dimensions
The system SHALL define swim events using pool length, event distance, and
stroke so that analytics can consistently bucket results. `effortType` SHALL
not participate in event identity or event creation flows. The system SHALL
ship with a built-in default event catalog derived from the checked-in national
standard event combinations, and administrators MAY add custom events only when
the built-in catalog is insufficient. Event definitions SHALL be shared across
male and female swimmers rather than duplicated by gender.

#### Scenario: Built-in event catalog is initialized
- **WHEN** the application initializes its local event catalog
- **THEN** the system ensures the built-in national-standard event combinations
  exist as selectable events with stable display-ready metadata

#### Scenario: Administrator creates a valid custom event
- **WHEN** an administrator submits a unique combination of pool length, event
  distance, and stroke using the supported pool-length options
- **THEN** the system stores the event and returns a display-ready event
  definition

#### Scenario: Administrator submits an existing event combination
- **WHEN** an administrator submits an event whose pool length, event distance,
  and stroke match an existing built-in or custom event from the admin events
  page
- **THEN** the UI surfaces an explicit already-exists style message and avoids
  adding any duplicate event card to local state

#### Scenario: Event is matched for different swimmers
- **WHEN** two swimmers of different genders select `50米 自由泳（长池）`
- **THEN** the system uses the same event definition for both swimmers and only
  varies the official benchmark lookup by swimmer gender
