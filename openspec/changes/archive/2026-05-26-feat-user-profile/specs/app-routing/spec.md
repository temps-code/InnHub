# Delta for App Routing

## MODIFIED Requirements

### Requirement: Route Metadata with Group and Role Fields

Route metadata MUST include `group` and `minRole`. A `canAccess(minRole, userRole)` helper MUST use `>=` against numeric levels: administrator (70) > manager (60) > receptionist (50) > housekeeping (40) > maintenance (30) > any (10). `ProtectedRouteId` MUST include `"profile"`.
(Previously: peers housekeeping|maintenance at bottom; no `any` level; canAccess had peer-equality logic)

#### Scenario: Hierarchy resolves with >= comparison

- GIVEN a route with minRole = "administrator"
- WHEN canAccess is called with userRole = "manager"
- THEN it MUST return false
- WHEN userRole = "administrator"
- THEN it MUST return true

#### Scenario: Any-level routes accessible to all roles

- GIVEN a route with minRole = "any" (level 10)
- WHEN canAccess is called with any authenticated user role
- THEN it MUST return true

#### Scenario: Peer roles no longer equal

- GIVEN a route with minRole = "housekeeping" (level 40)
- WHEN canAccess is called with userRole = "maintenance" (level 30)
- THEN it MUST return false

### Requirement: Settings Nested Routes

Routes MUST render under `/app/settings/*` via a SettingsLayout. `/app/properties` MUST redirect to `/app/settings/property`. Profile route MUST be included.

#### Scenario: Settings layout renders for profile

- GIVEN a user navigates to `/app/settings/property`, `/app/settings/users`, or `/app/settings/profile`
- WHEN the route resolves
- THEN it MUST render through a SettingsLayout inside the protected shell

### Requirement: MVP Module Placeholder Destinations

The system MUST provide placeholders for all MVP modules, with property profile, users, and profile under settings.

#### Scenario: Placeholders include profile

- GIVEN the protected route group is available
- WHEN navigation destinations are visited
- THEN placeholders MUST exist at top-level paths for dashboard, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports
- AND placeholders for property profile, users, and profile MUST exist under /app/settings/*

### Requirement: Sidebar Grouped Sections

Sidebar MUST render items grouped by `group` with section headers. Items with minRole above user's role MUST be excluded. A pinned "My Profile" item MUST appear below all groups (minRole: any).

#### Scenario: Pinned item visible to all roles

- GIVEN any authenticated user
- WHEN the sidebar renders
- THEN "My Profile" MUST be visible regardless of the user's role

### Requirement: Test and Documentation Coverage

Tests MUST cover all 6 AppProfileRoles including `any`, settings routes including profile, and the redirect.
(Previously: 5 roles excluding `any`)

#### Scenario: Tests verify all-role behavior

- GIVEN routing tests execute with parameterized role data
- WHEN each of the 6 AppProfileRoles (any, administrator, manager, receptionist, housekeeping, maintenance) renders the sidebar
- THEN tests MUST verify role-specific group visibility per role
- AND verify `/app/settings/profile` resolves correctly
- AND verify `/app/properties` redirects

## Acceptance Criteria

- `any` added as base role level (10) with `>=` comparison in canAccess.
- housekeeping (40) and maintenance (30) are no longer peers.
- `"profile"` is a valid ProtectedRouteId with minRole: any.
- Profile route renders at `/app/settings/profile` via SettingsLayout.
- "My Profile" appears as pinned sidebar item below all groups.
- `npm run test:run` passes with updated tests for 6 roles, profile route, and canAccess.
