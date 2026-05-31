# App Shell Specification

## Purpose

Define prototype-aligned visual and accessibility requirements for the protected InnHub app shell navigation (sidebar and topbar) while preserving current routing, auth/session behavior, and backend boundaries.

## Requirements

### Requirement: Sidebar Prototype-Aligned Active Navigation

The system MUST render protected sidebar navigation with a clearly emphasized active-item state aligned to the internal prototypes, including icon + label rhythm and a visually distinct active treatment.

#### Scenario: Active route is visibly emphasized

- GIVEN a protected route is active
- WHEN the sidebar renders navigation links
- THEN the active item MUST be visually stronger than inactive items
- AND inactive items MUST preserve hover and focus-visible affordances
- AND active/inactive styling MUST remain readable in supported themes

#### Scenario: Route model is preserved

- GIVEN grouped protected route metadata exists
- WHEN the sidebar renders
- THEN it MUST continue using existing grouped route items and labels
- AND it MUST NOT add, remove, or remap route destinations as part of visual polish

### Requirement: Sidebar Property Context Card

The system MUST provide a prototype-aligned property context treatment in the sidebar footer area.

#### Scenario: Property context is visible in sidebar

- GIVEN a user is in the protected shell
- WHEN the sidebar is rendered
- THEN a property context card MUST be visible near the sidebar footer
- AND the card MUST expose an accessible label or text for property context
- AND the card MUST NOT mutate active property or permissions in this change

### Requirement: Topbar Route Context and Action Cluster

The system MUST render a topbar with route context on the left and a compact prototype-aligned action cluster on the right, while preserving existing account controls.

#### Scenario: Topbar shows route context

- GIVEN a protected route is active
- WHEN the topbar renders
- THEN it MUST display the route title
- AND it SHOULD display contextual supporting text for the current workspace

#### Scenario: Topbar shows compact action cluster

- GIVEN the topbar renders
- WHEN users inspect topbar actions
- THEN the topbar MUST include a compact action cluster consistent with prototype hierarchy (date/context pill, notification/avatar/property affordances, and account controls)
- AND logout and preference controls MUST remain available
- AND presentational affordances in this cluster MUST NOT introduce new backend or auth workflows

### Requirement: Responsive Drawer Behavior Preservation

The system MUST preserve current mobile drawer interaction behavior while applying shell visual polish.

#### Scenario: Mobile drawer still opens and closes through existing controls

- GIVEN a viewport below desktop breakpoint
- WHEN the user opens the navigation drawer and then clicks backdrop, close button, or a navigation link
- THEN the drawer MUST close as it does in current behavior
- AND no additional interaction steps MUST be required

### Requirement: Accessibility and Theme-Token Safety

The system MUST keep shell navigation accessible and theme-safe after visual polish.

#### Scenario: Shell controls remain accessible

- GIVEN sidebar and topbar interactive elements
- WHEN rendered and focused via keyboard
- THEN controls MUST have accessible names
- AND focus-visible indication MUST remain perceivable
- AND navigation landmarks MUST remain present

#### Scenario: Visual polish remains theme-token safe

- GIVEN light and dark theme usage
- WHEN shell visuals are rendered
- THEN styling MUST use existing semantic tokens and supported theme variants
- AND the change MUST NOT rely on hard-coded single-theme page styling that breaks alternate theme readability

### Requirement: No Behavior, Backend, or Permission Changes

The system MUST keep this change presentation-only.

#### Scenario: Non-shell behavior remains unchanged

- GIVEN protected app behavior before this change
- WHEN this change is applied
- THEN auth/session flow, logout semantics, route guards, role visibility logic, and permission checks MUST remain unchanged
- AND backend services, InsForge integration, RLS, and data workflows MUST remain untouched
- AND feature-page business behavior MUST remain untouched
