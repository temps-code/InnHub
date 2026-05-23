# App Routing Specification

## Purpose

Define the frontend routing foundation and structural protected application layout for InnHub so future MVP modules have stable route destinations, shared navigation, and a reusable app shell before feature workflows, backend integration, or real authentication are implemented.

## Requirements

### Requirement: Public Route Group

The system MUST define a public route group for unauthenticated-facing pages and structural entry points without requiring backend access, real session checks, or feature workflow behavior.

#### Scenario: Public routes render without the protected shell

- GIVEN a user opens a public route such as a landing or login placeholder
- WHEN the route is rendered
- THEN the page MUST render without the protected application sidebar
- AND the page MUST render without the protected application topbar
- AND no backend, InsForge, session, or role validation MUST be required to render it

#### Scenario: Public placeholders remain structural

- GIVEN a public login or landing placeholder is present
- WHEN the user views the page
- THEN the page MUST communicate placeholder or entry-point purpose only
- AND it MUST NOT perform login, logout, registration, password recovery, or session persistence behavior

### Requirement: Structural Protected Route Group

The system MUST define a protected application route group that represents authenticated application space structurally while deferring real authentication, authorization, and session enforcement to a future change.

#### Scenario: Protected routes render through a structural boundary

- GIVEN a user opens any protected application route
- WHEN the route is rendered
- THEN the route MUST render through a shared protected layout boundary
- AND the boundary MUST be structural only
- AND it MUST NOT block, redirect, or authorize users based on real authentication state

#### Scenario: Real auth behavior is deferred

- GIVEN the protected route boundary exists
- WHEN the application renders protected content
- THEN it MUST NOT call an auth provider, backend service, InsForge API, or browser persistence mechanism to validate a session
- AND it MUST NOT implement RBAC or role-based route access rules

### Requirement: Shared Application Shell

The system MUST provide a shared application shell for protected routes with sidebar navigation, a topbar or header area, and a main content outlet for nested route content.

#### Scenario: Protected content uses the shell regions

- GIVEN a protected route is active
- WHEN the page renders
- THEN the shell MUST display sidebar navigation
- AND the shell MUST display a topbar or header area
- AND the shell MUST display the active route content inside a main workspace outlet

#### Scenario: Nested content stays inside the workspace

- GIVEN a user navigates between protected module routes
- WHEN each route is rendered
- THEN the sidebar and topbar MUST remain shared shell regions
- AND only the main content outlet SHOULD change for the active module page

### Requirement: MVP Module Placeholder Destinations

The system MUST provide protected placeholder destinations for the MVP modules needed by the current product scope, without implementing module workflows or backend-backed data views.

#### Scenario: Core module placeholders are reachable

- GIVEN the protected application route group is available
- WHEN navigation destinations are inspected or visited
- THEN placeholders MUST exist for dashboard, properties, users, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports
- AND each placeholder MUST identify its module purpose in a compact, non-workflow page

#### Scenario: Placeholders do not become feature implementations

- GIVEN a module placeholder is rendered
- WHEN the user views the placeholder
- THEN it MUST NOT include operational forms, editable records, real tables, calculated metrics, reservation availability logic, room state transitions, payment behavior, or workflow actions
- AND it MUST NOT implement the Room Status Board

### Requirement: Route and Navigation Consistency

The system MUST keep protected navigation entries consistent with the route definitions so labels and paths do not drift across the shell and router.

#### Scenario: Navigation points to existing protected routes

- GIVEN the sidebar navigation is rendered
- WHEN each protected navigation link is followed
- THEN the target route MUST exist in the protected route tree
- AND the corresponding placeholder or route content MUST render in the shell workspace

#### Scenario: Route labels are not duplicated inconsistently

- GIVEN a protected module has a route path and navigation label
- WHEN the shell renders navigation and the route renders content
- THEN the visible label and destination SHOULD come from a shared route or navigation metadata source where practical
- AND route/navigation naming MUST remain consistent for review and future changes

### Requirement: Architecture Boundary Compliance

The routing foundation, protected layout, shell, navigation, and placeholders MUST follow the documented frontend architecture boundaries and remain presentation/structure focused.

#### Scenario: App routing stays in the app layer

- GIVEN route definitions, route metadata, protected layout, or shell composition are added
- WHEN their location and dependencies are reviewed
- THEN they SHOULD live under the app layer or use shared generic UI primitives
- AND they MUST NOT place app-wide routing concerns inside feature workflow components

#### Scenario: No backend or feature service access from structural components

- GIVEN a routing, layout, shell, navigation, or placeholder component is rendered
- WHEN its behavior is inspected
- THEN it MUST NOT call InsForge, backend APIs, feature services, realtime subscriptions, or data-fetching hooks
- AND it MUST NOT define backend service contracts or database assumptions

#### Scenario: Prototype guidance is used only as reference

- GIVEN the app shell is inspired by the Stitch prototype evaluation
- WHEN the implementation is reviewed
- THEN it MAY adopt the general sidebar, topbar, and workspace composition
- BUT it MUST NOT directly port Stitch-generated HTML, CDN Tailwind configuration, inline scripts, Chart.js usage, or prototype-only code

## Acceptance Criteria

- Public and protected route groups are explicitly represented in the frontend route structure.
- Protected routes render through a shared shell with sidebar, topbar, and main content outlet.
- Dashboard, properties, users, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports have protected placeholder destinations only.
- Navigation links and route definitions remain consistent and reviewable.
- Structural route/layout components perform no backend, InsForge, real auth, session, RBAC, or feature workflow behavior.
- Room Status Board implementation, Stitch HTML porting, backend work, and real authentication remain outside this change.
