## MODIFIED Requirements

### Requirement: Primary pages SHALL support desktop and mobile layouts
The system SHALL render all primary admin and public pages in layouts that
remain usable on desktop browsers and mobile phone browsers. The shared
component layer SHALL remain responsive on both viewport classes.

#### Scenario: Visitor opens a public page on a mobile device
- **WHEN** a public page is rendered on a phone-sized viewport
- **THEN** the shared component layer preserves readable spacing, reachable
  actions, and no horizontal overflow

#### Scenario: Administrator opens a management page on a desktop browser
- **WHEN** an admin management page is rendered on a desktop-sized viewport
- **THEN** the shared component layer supports dense but readable desktop
  layouts without breaking interaction states
