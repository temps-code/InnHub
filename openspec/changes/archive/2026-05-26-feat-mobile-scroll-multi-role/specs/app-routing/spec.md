# Delta for app-routing

## ADDED Requirements

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

## MODIFIED Requirements

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
