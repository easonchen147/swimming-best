## MODIFIED Requirements

### Requirement: Global Design Language
The system SHALL implement a unified, modern design language across all
frontend interfaces, strictly adhering to `frontend-design` and
`frontend-skill` standards. This includes consistent typography, a refined
color palette with depth (shadows/glassmorphism), and a grid-based layout for
all management and public views. All pages SHALL use a standard layout wrapper
that provides smooth exit and entry transitions when navigating. The shared
component layer SHALL follow a shadcn/ui-style component language while
preserving the product's existing color palette. Periodic UI audits SHALL
differentiate between true primitive-usage drift and acceptable project-level
visual customization built on top of correct shadcn/Radix semantics.

#### Scenario: User navigates between different pages
- **WHEN** a user moves from the admin dashboard to the swimmer roster
- **THEN** the visual elements (buttons, cards, headers, spacing) remain
  consistent in style and feel AND the outgoing page fades out while the
  incoming page slides or fades in smoothly

#### Scenario: Team audits shared UI primitives
- **WHEN** maintainers review the shared UI component layer
- **THEN** they treat incorrect primitive root semantics as defects, but do not
  classify project-specific visual theming on top of correct primitives as a
  shadcn migration gap
