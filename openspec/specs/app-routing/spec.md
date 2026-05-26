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

The system MUST derive the user role from the authenticated session, filter sidebar navigation by role, and restrict direct URL path access to authorized roles.
(Previously: The system filtered sidebar navigation but did not restrict direct URL access or enforce route-level access guards.)

#### Scenario: Sidebar shows only accessible entries

- GIVEN a user opens a protected route
- WHEN the sidebar renders
- THEN entries whose minRole exceeds the user's role MUST be hidden

#### Scenario: Role derived from auth session

- GIVEN the protected layout renders
- WHEN the user role is available from useAuthSession
- THEN the layout MUST use it to filter which sidebar items appear

#### Scenario: Direct URL access is denied for unauthorized roles

- GIVEN a user tries to access a route whose minRole exceeds the user's role
- WHEN the route is requested via a direct URL path
- THEN the system MUST deny access
- AND the system MUST render a Denied page or redirect the user to a safe page

### Requirement: Shared Application Shell

The system MUST accept grouped, role-filtered route items and render sidebar navigation in labeled sections.

#### Scenario: Three labeled groups in sidebar

- GIVEN a user with administrator role
- WHEN the sidebar displays
- THEN navigation items MUST appear in three groups: operations, reports, settings
- AND each group MUST show a section header

### Requirement: MVP Module Placeholder Destinations

The system MUST provide placeholders for all MVP modules, with property profile and users under a settings group.

#### Scenario: Placeholders reachable at new paths

- GIVEN the protected route group is available
- WHEN navigation destinations are visited
- THEN placeholders MUST exist for dashboard, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports at top-level paths
- AND placeholders for property profile and users MUST exist under /app/settings/*

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

### Requirement: Route Metadata with Group and Role Fields

Route metadata MUST include `group` (`operations | reports | settings`) and `minRole: AppProfileRole`. A `canAccess(minRole, userRole)` helper MUST enforce: administrator > manager > receptionist > (housekeeping | maintenance).

#### Scenario: Metadata carries group and minRole

- GIVEN a route is defined in routeMetadata
- WHEN inspected
- THEN it MUST have a group and minRole value

#### Scenario: Hierarchy resolves correctly

- GIVEN a route with minRole = "administrator"
- WHEN canAccess is called with userRole = "manager"
- THEN it MUST return false
- WHEN userRole = "administrator"
- THEN it MUST return true

### Requirement: Settings Nested Routes

Routes MUST render under `/app/settings/*` via a SettingsLayout. The old `/app/properties` MUST redirect to `/app/settings/property`.

#### Scenario: Settings layout renders

- GIVEN a user navigates to `/app/settings/property` or `/app/settings/users`
- WHEN the route resolves
- THEN it MUST render through a SettingsLayout inside the protected shell

#### Scenario: Properties path redirects

- GIVEN a user visits `/app/properties`
- WHEN the route resolves
- THEN it MUST redirect to `/app/settings/property`

### Requirement: Sidebar Grouped Sections

The sidebar MUST render items grouped by `group` field with section headers. Items with minRole above the user's role MUST be excluded.

#### Scenario: Administrator sees all groups

- GIVEN a user with administrator role
- WHEN the sidebar renders
- THEN three groups MUST appear: operations, reports, settings

#### Scenario: Receptionist sees filtered view

- GIVEN a user with receptionist role
- WHEN the sidebar renders
- THEN settings items MUST be hidden (minRole = administrator)
- AND reports items MUST be hidden (minRole = manager)

### Requirement: Test and Documentation Coverage

Tests MUST cover role filtering across all 5 AppProfileRoles, settings routes, and the redirect. Architecture docs MUST describe the route group structure.
(Previously: Tests only verified administrator and receptionist roles)

#### Scenario: Tests verify all-role routing behavior

- GIVEN routing tests execute with parameterized role data
- WHEN each of the 5 AppProfileRoles (administrator, manager, receptionist, housekeeping, maintenance) renders the sidebar
- THEN tests MUST verify role-specific group visibility per role
- AND verify `/app/settings/*` resolves correctly
- AND verify `/app/properties` redirects

#### Scenario: Docs updated

- GIVEN architecture docs (English and Spanish)
- WHEN a reviewer reads them
- THEN they MUST describe the three route groups and settings nesting

### Requirement: Responsive Mobile Navigation Drawer

On small viewports (< 768px), the system MUST render the main navigation drawer off-canvas and provide a Menu toggle button.

#### Scenario: Mobile drawer slides out

- GIVEN a user on a viewport narrower than 768px
- WHEN the user clicks the Menu button
- THEN the main navigation drawer MUST slide out off-canvas

#### Scenario: Mobile drawer closes automatically

- GIVEN the off-canvas navigation drawer is open on a mobile viewport
- WHEN the user clicks the backdrop or any navigation link
- THEN the navigation drawer MUST close automatically

### Requirement: Mobile Sidebar Independent Scroll

On viewports below 768px, the navigation drawer MUST keep the header (logo + close button) fixed while allowing the navigation list to scroll independently.

#### Scenario: Header stays fixed, nav scrolls on mobile

- GIVEN a user on a viewport narrower than 768px
- WHEN the mobile navigation drawer is open
- THEN the drawer header with logo and close button MUST remain fixed at the top
- AND the navigation list below the header MUST scroll independently within the drawer

#### Scenario: Scroll splitting not applied on desktop

- GIVEN a viewport of 768px or wider
- WHEN the sidebar renders
- THEN the sidebar MUST render without independent header/nav scroll splitting

## Acceptance Criteria

- Public and protected route groups are explicitly represented in the frontend route structure.
- Protected routes render through a shared shell with sidebar, topbar, and main content outlet.
- Dashboard, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports have protected placeholder destinations at top-level paths.
- Property profile and users have protected placeholder destinations under /app/settings/*.
- Routes are organized into three groups (operations, reports, settings) with role-based sidebar visibility.
- Navigation links and route definitions remain consistent and reviewable.
- Structural route/layout components perform no backend, InsForge, real auth, session, RBAC, or feature workflow behavior.
- Room Status Board implementation, Stitch HTML porting, backend work, and real authentication remain outside this change.
