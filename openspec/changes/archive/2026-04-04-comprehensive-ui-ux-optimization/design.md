## Context

The current frontend is a Next.js application using Tailwind CSS for styling and Recharts for data visualization. While functional, the user experience is static and lacks the interactive polish expected of a modern sports performance tracking system. Feedback indicates that data entry is tedious for admins, and the public view of swimmer progress is not sufficiently engaging.

## Goals / Non-Goals

**Goals:**
- **Modernize Aesthetic**: Unified design language with consistent spacing, typography, and color palette.
- **Enhance Interactivity**: Implement smooth transitions, hover effects, and interactive data visualizations using `motion` and `recharts`.
- **Streamline Data Entry**: Optimize admin forms and workflows for faster and more accurate data recording.
- **Improve Accessibility & Responsiveness**: Ensure all new UI elements are accessible and work seamlessly across all device sizes.
- **Zero Logic Impact**: All changes must be strictly UI/UX focused, preserving existing business logic and API contracts.

**Non-Goals:**
- No changes to the backend API architecture or database schema.
- No introduction of new heavy third-party UI libraries beyond what's already in use (Radix UI, Motion, Recharts).
- No refactoring of non-UI related logic (e.g., calculation algorithms, auth flows).

## Decisions

- **Decision 1: Use `motion` for all layout and component transitions.**
  - **Rationale**: `motion` (Framer Motion) is already in the project and provides a robust, declarative API for complex animations that feel natural.
  - **Alternatives**: CSS Transitions/Animations (less flexible for complex sequences), GSAP (unnecessary overhead).

- **Decision 2: Standardize on Radix UI primitives for interactive components.**
  - **Rationale**: Ensures high accessibility and consistent behavior for complex UI elements like dropdowns, dialogs, and tabs.
  - **Alternatives**: Custom-built primitives (higher maintenance, lower accessibility).

- **Decision 3: Enhance Recharts with custom tooltips and active state animations.**
  - **Rationale**: Standard Recharts are a bit dry; custom components for tooltips and synchronized active states will make data exploration more intuitive.
  - **Alternatives**: Switching to D3 (too complex), Chart.js (less React-idiomatic than Recharts).

- **Decision 4: Implement a "Quick Record" overlay for Admin.**
  - **Rationale**: Allows admins to record performances from anywhere in the app without losing context, significantly improving speed.
  - **Alternatives**: Multi-step wizards (slower), separate management pages (higher friction).

## Risks / Trade-offs

- **[Risk] Performance Degradation from Animations** 鈫 Use hardware-accelerated properties (transform, opacity) and keep animation durations short (200-400ms).
- **[Risk] Visual Overload** 鈫 Prioritize clarity over "flashiness"; use animations sparingly to guide the eye, not distract.
- **[Risk] Mobile Usability of Complex Charts** 鈫 Implement responsive chart containers and simplify legends/tooltips for smaller screens.
- **[Risk] Implementation Errors due to Large Scope** 鈫 Break down implementation into modular tasks (Layout -> Components -> Pages).
