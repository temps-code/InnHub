# Delta for app-routing

## MODIFIED Requirements

### Requirement: Structural Protected Route Group

The system MUST derive the user role from the authenticated session and filter sidebar navigation by role, without implementing route-level guards or 403 pages.
(Previously: Protected routes had no role awareness)

#### Scenario: Sidebar shows only accessible entries

- GIVEN a user opens a protected route
- WHEN the sidebar renders
- THEN entries whose minRole exceeds the user's role MUST be hidden
- AND direct URL access MUST still render content (no guard)

#### Scenario: Role derived from auth session

- GIVEN the protected layout renders
- WHEN the user role is available from useAuthSession
- THEN the layout MUST use it to filter which sidebar items appear

### Requirement: Shared Application Shell

The system MUST accept grouped, role-filtered route items and render sidebar navigation in labeled sections.
(Previously: Shell accepted a flat route list)

#### Scenario: Three labeled groups in sidebar

- GIVEN a user with administrator role
- WHEN the sidebar displays
- THEN navigation items MUST appear in three groups: operations, reports, settings
- AND each group MUST show a section header

### Requirement: MVP Module Placeholder Destinations

The system MUST provide placeholders for all MVP modules, with property profile and users under a settings group.
(Previously: All modules flat under /app/*)

#### Scenario: Placeholders reachable at new paths

- GIVEN the protected route group is available
- WHEN navigation destinations are visited
- THEN placeholders MUST exist for dashboard, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports at top-level paths
- AND placeholders for property profile and users MUST exist under /app/settings/*

## ADDED Requirements

### Requirement: Route Metadata with Group and Role Fields (REQ-RTG-GROUPS, REQ-RTG-ROLE-FILTER, REQ-RTG-ROLE-HIERARCHY)

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

### Requirement: Settings Nested Routes (REQ-RTG-SETTINGS-NEST, REQ-RTG-REDIRECT)

Routes MUST render under `/app/settings/*` via a SettingsLayout. The old `/app/properties` MUST redirect to `/app/settings/property`.

#### Scenario: Settings layout renders

- GIVEN a user navigates to `/app/settings/property` or `/app/settings/users`
- WHEN the route resolves
- THEN it MUST render through a SettingsLayout inside the protected shell

#### Scenario: Properties path redirects

- GIVEN a user visits `/app/properties`
- WHEN the route resolves
- THEN it MUST redirect to `/app/settings/property`

### Requirement: Sidebar Grouped Sections (REQ-RTG-SIDEBAR)

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

### Requirement: Test and Documentation Coverage (REQ-RTG-TESTS, REQ-RTG-DOCS)

Tests MUST cover role filtering, settings routes, and the redirect. Architecture docs MUST describe the route group structure.

#### Scenario: Tests verify new routing behavior

- GIVEN routing tests execute
- WHEN an administrator and a receptionist render the sidebar
- THEN tests MUST verify different group visibility per role
- AND verify `/app/settings/*` resolves correctly
- AND verify `/app/properties` redirects

#### Scenario: Docs updated

- GIVEN architecture docs (English and Spanish)
- WHEN a reviewer reads them
- THEN they MUST describe the three route groups and settings nesting
