## MODIFIED Requirements

### Requirement: Public pages SHALL expose only allowed swimmer data
The system SHALL provide public list and detail pages only for swimmers that are
configured as publicly visible, and public payloads MUST use the swimmer's
configured public display identity. The public home page SHALL display all
visible swimmers in a modern, card-based responsive layout or an enhanced
data table with fluid, interactive team filtering. This layout SHALL replace the
legacy table with a highly aesthetic presentation consistent with
`frontend-design` standards, featuring refined typography, card-level depth
(shadows/glass), and staggered entrance animations.

#### Scenario: Public list is requested
- **WHEN** a visitor loads the public swimmer listing
- **THEN** the system renders a modern, visually rich presentation of visible
  swimmers using cards or an enhanced table, including display name, team, and profile
  link with fluid hover effects and orchestrated entry animations

#### Scenario: Public list is filtered by managed team
- **WHEN** a visitor requests the public swimmer listing with a managed team
  identifier filter
- **THEN** the system returns only visible swimmers assigned to that team,
  using a smooth cross-fade or re-sorting animation (e.g., via `layoutId`) to
  update the view

#### Scenario: Public swimmer detail is requested
- **WHEN** a visitor requests a public swimmer page for a visible swimmer
- **THEN** the system renders an aesthetically superior detail page featuring
  hero headers, refined event summaries, goal charts with smooth entry animations,
  and clear visual hierarchies

### Requirement: Public pages SHALL support share and event detail views
The system SHALL provide share-oriented pages and per-event detail views for
visible swimmers so visitors can inspect PB, goal progress, and timelines with
a high-quality, "magazine-style" aesthetic. These views MUST feature refined
charts, smooth loading transitions, and a polished mobile-first interaction
model.

#### Scenario: Visitor opens a public event detail page
- **WHEN** a visitor requests a visible swimmer's event detail page
- **THEN** the system renders the view with animated charts, high-quality
  typography, and a cohesive design that emphasizes clarity and visual polish

#### Scenario: Visitor opens a PB share view
- **WHEN** a visitor opens a share view for a visible swimmer's PB summary
- **THEN** the system renders a highly-stylized, "shareable-card" presentation
  designed for visual impact, excluding admin-only controls and utilizing
  sophisticated layout and typography
