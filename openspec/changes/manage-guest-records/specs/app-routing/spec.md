# Delta for App Routing

## ADDED Requirements

### Requirement: Guests Module Route Availability

The system MUST expose a protected Guests route destination in the app shell for roles allowed by route metadata conventions.

#### Scenario: Guests route appears for authorized roles

- GIVEN an authenticated user whose role can access the guests module
- WHEN protected navigation is rendered
- THEN the Guests navigation item MUST be visible
- AND navigation to the Guests route MUST render the guests module page in the protected shell

#### Scenario: Guests route blocked for unauthorized roles

- GIVEN an authenticated user whose role is below the Guests route minimum role
- WHEN the user attempts direct URL access to the Guests route
- THEN access MUST be denied or safely redirected per protected-route policy

## Acceptance Criteria

- Guests is reachable as a protected module route for authorized roles.
- Guests navigation visibility and direct URL access enforcement follow existing role metadata and guard behavior.
