# Delta for App Routing

## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements
