# Auth Session Specification

## Purpose

Define InnHub's MVP authentication and app-session behavior so authenticated users can enter protected application routes, the frontend can access the current linked profile and single property context, and later feature services can build on a controlled session boundary without implementing property-scoped data access enforcement in this change.

## Requirements

### Requirement: InsForge Auth Boundary

The system MUST perform login and logout through the approved InsForge auth boundary without letting JSX components create InsForge clients or call InsForge directly.

#### Scenario: Login succeeds through the auth boundary

- GIVEN a user has valid InsForge credentials
- WHEN the user submits the login flow
- THEN the system MUST authenticate the user through the approved InsForge auth boundary
- AND the authenticated app session MUST become available to the frontend through the controlled session boundary
- AND the login UI component MUST NOT create an InsForge client directly

#### Scenario: Login failure stays safe

- GIVEN a user submits invalid credentials or InsForge rejects authentication
- WHEN the login flow completes
- THEN the system MUST keep the user unauthenticated
- AND it MUST show or expose a clear authentication error state
- AND it MUST NOT expose access tokens, anon keys, JWTs, or other secret values in UI or logs

#### Scenario: Logout clears authenticated app session

- GIVEN an authenticated app session is active
- WHEN the user logs out
- THEN the system MUST end the InsForge-authenticated session through the approved auth boundary
- AND it MUST clear the app session context
- AND protected application content MUST no longer render for that user until they authenticate again

### Requirement: Controlled Current Session Context

The system MUST expose current authentication, profile, and property context through a controlled provider/hook boundary for frontend consumers.

#### Scenario: Frontend reads current session from provider or hook

- GIVEN the application has initialized auth/session state
- WHEN frontend code needs the current app session
- THEN it MUST read session state through the approved provider or hook boundary
- AND the session state MUST distinguish loading, unauthenticated, authenticated, and invalid-session states
- AND consumers MUST NOT duplicate direct InsForge session lookups in components

#### Scenario: Session initialization is explicit

- GIVEN the application starts or refreshes
- WHEN session initialization runs
- THEN the system MUST determine whether an authenticated InsForge user exists
- AND it MUST expose loading state until the app can safely decide whether protected content may render
- AND it MUST NOT render protected app content while the session decision is unresolved

### Requirement: Linked Profile Resolution

The system MUST resolve the current InnHub profile for an authenticated user using `profiles.auth_user_id`.

#### Scenario: Authenticated user resolves to a profile

- GIVEN an authenticated InsForge user exists
- WHEN the app session is built
- THEN the system MUST find the linked InnHub profile whose `profiles.auth_user_id` matches the authenticated user identity
- AND the app session MUST include the linked profile data needed by the MVP session context
- AND profile lookup MUST happen behind an auth/session service or hook boundary rather than directly inside JSX components

#### Scenario: Missing profile is blocked safely

- GIVEN an authenticated InsForge user has no linked profile row
- WHEN the app session is built
- THEN the system MUST treat the app session as invalid for protected application access
- AND it MUST NOT render protected `/app/*` content
- AND it MUST expose a safe missing-profile state that does not silently grant access

#### Scenario: Inactive profile is blocked safely

- GIVEN an authenticated InsForge user resolves to a profile whose status is inactive or otherwise not allowed for app access
- WHEN the app session is built
- THEN the system MUST treat the app session as invalid for protected application access
- AND it MUST NOT render protected `/app/*` content
- AND it MUST expose a safe inactive-profile state that can be shown or handled by the auth UI boundary

### Requirement: Single Property Session Context

The system MUST expose exactly one `property_id` for the authenticated user's MVP app session.

#### Scenario: Valid profile provides one property

- GIVEN an authenticated user resolves to an active InnHub profile
- WHEN the app session is available
- THEN the session context MUST include exactly one `property_id` from the linked profile
- AND frontend consumers MUST use that session property context instead of inventing a separate current-property source for the MVP

#### Scenario: Missing property blocks protected access

- GIVEN an authenticated user's linked profile does not provide a valid `property_id`
- WHEN the app session is built
- THEN the system MUST treat the app session as invalid for protected application access
- AND it MUST NOT render protected `/app/*` content
- AND it MUST expose a safe invalid-property state

### Requirement: Protected Route Enforcement

The system MUST require a valid authenticated app session before rendering protected `/app/*` routes.

#### Scenario: Unauthenticated user cannot view protected content

- GIVEN no authenticated app session exists
- WHEN a user opens any `/app/*` route
- THEN the system MUST block or redirect the user through a clear public auth path
- AND it MUST NOT render the protected sidebar, topbar, workspace, or protected module placeholder content

#### Scenario: Valid session can view protected routes

- GIVEN an authenticated user has an active linked profile and exactly one property context
- WHEN the user opens a protected `/app/*` route
- THEN the protected route MUST render through the shared protected application shell
- AND the requested protected route content MAY render according to the existing app-routing specification

#### Scenario: Invalid profile session cannot view protected routes

- GIVEN an authenticated InsForge user has a missing, inactive, or invalid InnHub profile context
- WHEN the user opens any `/app/*` route
- THEN the system MUST block protected content
- AND it MUST expose a safe recovery or error path instead of treating the user as fully authenticated for the app

### Requirement: Architecture Boundary Compliance

The auth/session foundation MUST follow InnHub frontend architecture boundaries.

#### Scenario: Components do not call InsForge directly

- GIVEN reviewers inspect login, logout, provider, route, shell, and placeholder components
- WHEN they check dependencies and behavior
- THEN JSX components MUST NOT create InsForge clients directly
- AND JSX components MUST NOT call InsForge auth or database APIs directly
- AND InsForge access MUST remain behind approved service, hook, or provider boundaries

#### Scenario: Auth stays inside auth/session scope

- GIVEN the auth/session change is reviewed
- WHEN reviewers inspect repository changes
- THEN the change MUST NOT implement feature CRUD, reservation workflows, room workflows, billing workflows, dashboard metrics, realtime subscriptions, storage uploads, or broad UI redesign
- AND it MUST NOT introduce registration, password reset, MFA, OAuth/social login, invitation flows, or user-management CRUD

### Requirement: Property Access Enforcement Deferral

The system MUST provide session property context for later property-scoped data access while leaving issue #7 enforcement out of scope.

#### Scenario: Session exposes property context without enforcing all data access

- GIVEN an authenticated app session includes a `property_id`
- WHEN later feature services are implemented
- THEN they MAY consume the session `property_id` as their current property context
- BUT this change MUST NOT be required to implement full property-scoped data access policies, RLS, cross-table filtering, or feature-service enforcement

#### Scenario: Issue boundaries remain explicit

- GIVEN issue #5 is accepted
- WHEN future security work is planned
- THEN property-scoped data access enforcement MUST remain owned by issue #7
- AND seed/demo data MUST remain owned by issue #8 unless a design-approved test fixture is required

### Requirement: Auth Session TDD and Validation

The implementation MUST satisfy strict TDD for auth/session behavior using repository tests before verification is accepted.

#### Scenario: Tests cover auth/session behavior

- GIVEN strict TDD is enabled
- WHEN issue #5 is applied
- THEN tests running through `npm run test:run` MUST cover login success or failure behavior at the auth boundary, logout session clearing, session provider or hook states, profile/property resolution, protected-route blocking, and valid-session protected access
- AND tests SHOULD assert user-visible or session-boundary behavior rather than brittle SDK internals where practical

#### Scenario: TDD evidence is recorded

- GIVEN issue #5 apply evidence is written
- WHEN reviewers inspect the apply artifact
- THEN it MUST record RED/GREEN or equivalent strict-TDD evidence for the auth/session and protected-route tests
- AND final validation MUST include `npm run test:run`

## Acceptance Criteria

- Login works through the approved InsForge auth boundary.
- Logout clears the authenticated app session and prevents protected content from continuing to render.
- Current auth/session state is available through a controlled provider or hook boundary.
- The app session resolves the linked InnHub profile through `profiles.auth_user_id`.
- The app session exposes exactly one `property_id` for the MVP user context.
- Missing, inactive, or invalid profile/property states block protected app access safely.
- Protected `/app/*` routes require a valid authenticated app session and do not render protected content for unauthenticated users.
- JSX components do not create InsForge clients or call InsForge directly.
- Full property-scoped data access enforcement remains out of scope for issue #7.
- Registration, password reset, MFA, OAuth/social login, invitations, user-management CRUD, feature CRUD, seed data, realtime, Storage, and payment behavior remain out of scope.
- Strict-TDD tests run through `npm run test:run` during apply and verify auth/session behavior.
