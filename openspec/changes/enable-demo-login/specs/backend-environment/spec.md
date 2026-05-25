# Delta for Backend Environment

## ADDED Requirements

### Requirement: Demo Credential Configuration Documentation

The system MUST document any frontend demo credential configuration using Vite-compatible names and placeholder values only.

#### Scenario: Environment example lists demo credential placeholders

- GIVEN the implementation uses frontend-configured demo credentials
- WHEN a developer opens `.env.example`
- THEN the system MUST show placeholder-only demo credential variables with Vite-compatible names
- AND the file MUST NOT contain real passwords, real API keys, anon keys, JWTs, access tokens, or private secrets.

#### Scenario: Demo credential values are treated as public

- GIVEN demo credential variables are exposed to the Vite frontend bundle
- WHEN documentation describes those variables
- THEN it MUST state that such values are public demo-only credentials, not secrets
- AND it MUST warn that production or personal credentials MUST NOT be committed or treated as protected by frontend env naming.

### Requirement: Demo Backend Setup Documentation

The system MUST document the backend state required for demo login without requiring repository-managed production seed data.

#### Scenario: Developer prepares demo backend state

- GIVEN a developer or evaluator wants to use demo login
- WHEN they follow setup documentation
- THEN they MUST be told that a matching InsForge Auth user must exist
- AND an active `profiles` row MUST link that auth user through `profiles.auth_user_id`
- AND the linked profile MUST reference a valid property through `property_id`.

#### Scenario: Documentation preserves setup boundary

- GIVEN demo setup documentation is reviewed
- WHEN reviewers inspect the change
- THEN it MUST NOT claim that repository code creates the external InsForge Auth user unless such provisioning is explicitly implemented and validated
- AND it MUST NOT introduce database schema changes, RLS/policy changes, or production seed data as part of this demo-login change.

### Requirement: Demo Configuration Safe Missing-State Handling

The system MUST define a safe missing-configuration state for demo login that does not expose configured values or backend secrets.

#### Scenario: Missing demo config is explicit and non-secret

- GIVEN one or more required demo credential values are absent or blank
- WHEN the login page needs to decide whether demo access is available
- THEN the system MUST expose an intentional unavailable, disabled, hidden, or safe-error state
- AND the state MUST NOT render passwords, anon keys, tokens, JWTs, raw environment values, or raw backend payloads.

## Acceptance Criteria

- Demo credential configuration, if used, is documented with Vite-compatible placeholder names only.
- Documentation treats frontend demo credentials as public demo-only values and preserves secret hygiene.
- Setup documentation explains the required InsForge Auth user, active linked profile, and property association.
- Missing demo configuration is handled explicitly and safely.
- The change does not introduce schema changes, RLS/policy changes, production seed data, or remote user provisioning unless separately planned and validated.
