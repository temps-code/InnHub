# Delta for Auth Session

## ADDED Requirements

### Requirement: Visible Demo Login Option

The system MUST present a visible demo-login option on the login page so evaluators can discover how to access protected MVP flows without prior credential knowledge.

#### Scenario: Login page exposes demo access

- GIVEN a user opens the public login page
- WHEN the login UI renders
- THEN the system MUST show a clear demo-login affordance such as `Use demo account`
- AND the demo-login affordance MUST be distinguishable from manual email/password submission
- AND the login page MUST continue to support manual email/password login.

#### Scenario: Demo access remains limited to auth validation

- GIVEN the demo-login option is available
- WHEN reviewers inspect the resulting auth UI behavior
- THEN the system MUST NOT introduce public signup, self-service onboarding, invitation flows, or property/profile creation from the login page
- AND it MUST NOT introduce theme/language controls, broad feature CRUD, or unrelated application workflows.

### Requirement: Demo Login Uses Existing Auth Session Flow

The system MUST submit demo credentials through the same controlled auth/session login flow used by manual login.

#### Scenario: Demo login submits through the existing login boundary

- GIVEN demo credentials are configured
- WHEN the user activates the demo-login option
- THEN the system MUST call the existing login/auth-session boundary with those credentials
- AND authentication MUST proceed through the approved InsForge auth boundary
- AND JSX components MUST NOT create InsForge clients or call InsForge auth/database APIs directly.

#### Scenario: Manual login behavior is preserved

- GIVEN the login page supports manual email/password login
- WHEN the demo-login option is added
- THEN manual login MUST continue to submit user-provided credentials through the existing login/auth-session boundary
- AND manual login failures MUST remain safe and understandable.

### Requirement: Demo Login Preserves Profile and Property Validation

The system MUST NOT create fake local sessions, inject hardcoded property context, or bypass linked-profile, active-profile, or property validation for demo access.

#### Scenario: Demo authentication still requires linked profile

- GIVEN demo credentials authenticate to an InsForge user
- WHEN the app session is built
- THEN the system MUST resolve the linked InnHub profile by `profiles.auth_user_id`
- AND it MUST block protected app access if the linked profile is missing.

#### Scenario: Demo authentication still requires active profile

- GIVEN demo credentials authenticate to an InsForge user whose linked profile is inactive
- WHEN the app session is built
- THEN the system MUST treat the session as invalid for protected app access
- AND it MUST NOT render protected `/app/*` content.

#### Scenario: Demo authentication still requires one property context

- GIVEN demo credentials authenticate to an InsForge user whose linked profile has no valid `property_id`
- WHEN the app session is built
- THEN the system MUST treat the session as invalid for protected app access
- AND it MUST NOT invent, hardcode, or accept UI-supplied property scope.

### Requirement: Demo Login Safe Failure Handling

The system MUST handle missing demo configuration and demo-login failures safely without leaking passwords, access tokens, anon keys, JWTs, or raw backend payloads.

#### Scenario: Missing demo configuration is safe

- GIVEN required demo credential configuration is absent or incomplete
- WHEN the login page renders or the user attempts demo access
- THEN the system MUST either hide, disable, or safely reject the demo-login action with explanatory non-secret copy
- AND it MUST NOT expose configured secrets, token values, raw environment values, or stack traces.

#### Scenario: Demo login failure is safe

- GIVEN demo credentials are configured but authentication fails or profile validation fails
- WHEN the demo-login attempt completes
- THEN the system MUST keep the user unauthenticated or invalid according to the existing session rules
- AND it MUST show or expose a clear safe error state
- AND it MUST NOT log or render demo passwords, tokens, anon keys, JWTs, or raw backend payloads.

### Requirement: Demo Login TDD and Validation

The implementation MUST satisfy strict TDD for demo-login behavior using repository tests before verification is accepted.

#### Scenario: Tests cover demo-login behavior

- GIVEN strict TDD is enabled
- WHEN this change is applied
- THEN tests running through `npm run test:run` MUST cover visible demo access, configured demo submission through the existing login boundary, missing demo configuration behavior, and preservation of manual login behavior
- AND tests SHOULD assert user-visible behavior or auth/session boundary calls rather than brittle InsForge SDK internals.

#### Scenario: Validation preserves scope boundaries

- GIVEN this change is verified
- WHEN reviewers inspect changed files and evidence
- THEN the change MUST NOT include public signup, self-service onboarding, invitation flows, theme/language controls, broad feature CRUD, schema changes, RLS/policy changes, Storage, realtime, payment behavior, or new UI library installation
- AND final validation MUST include `npm run test:run`.

## Acceptance Criteria

- Login page presents a clear demo-login option.
- Demo login uses the same real auth/session flow as manual login.
- Demo login does not create fake sessions or bypass linked-profile, active-profile, or `property_id` validation.
- Missing demo configuration and demo-login failures are safe and do not leak secrets or raw backend payloads.
- Manual email/password login remains supported.
- Public signup, onboarding, theme/language controls, broad feature CRUD, and unrelated workflows remain out of scope.
- Strict-TDD tests run through `npm run test:run` during apply and verify demo-login behavior.
