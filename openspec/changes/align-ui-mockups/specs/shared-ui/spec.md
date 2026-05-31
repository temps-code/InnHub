# Delta for Shared UI

## ADDED Requirements

### Requirement: Mockup-Aligned Visual Tokens and Surfaces

The system MUST align shared visual presentation for landing, login, and authenticated shell surfaces with the approved mockup direction using the existing styling stack.

#### Scenario: Shared visual rhythm is aligned without changing behavior

- GIVEN landing, login, and app shell pages render with existing routes and data flows
- WHEN visual alignment updates are applied
- THEN spacing, typography, color usage, radii, and elevation MUST align with the approved mockup direction
- AND interactive states (default, hover, focus, active, disabled) MUST remain visible and accessible
- AND no route, auth, permission, or data behavior MUST be changed

### Requirement: No New UI Library or Generated Markup Port

The system MUST keep visual alignment implementation within existing React, TypeScript, Tailwind, and shared component foundations.

#### Scenario: Implementation source remains within approved stack

- GIVEN reviewers inspect landing, login, shell, and shared-style updates
- WHEN dependencies and source patterns are reviewed
- THEN the change MUST NOT add a new UI component library
- AND it MUST NOT copy generated prototype HTML, CDN Tailwind config, inline scripts, or prototype chart code into production source

### Requirement: Visual-Only TDD Regression Coverage

The system MUST preserve and update tests only where user-observable visual state contracts are asserted.

#### Scenario: Tests cover preserved shell and auth-adjacent behavior

- GIVEN strict TDD mode is active
- WHEN visual alignment changes affect test-backed classes or state indicators
- THEN tests MUST be updated via RED/GREEN flow to assert preserved responsive drawer behavior and visible interaction states
- AND `npm run test:run` MUST pass before verification is accepted

## Acceptance Criteria

- Landing, login, and authenticated shell visuals align with approved mockup direction for tokens and surface hierarchy.
- Existing shared UI primitives remain domain-neutral and behavior-preserving.
- No new UI library or generated prototype markup/config/scripts are introduced.
- Accessibility-visible focus and state cues remain present.
- `npm run test:run` remains required and passing for verification.