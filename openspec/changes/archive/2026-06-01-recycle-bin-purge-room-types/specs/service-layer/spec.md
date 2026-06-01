# Delta for Service Layer

## MODIFIED Requirements

### Requirement: Shared Service Result Convention

The system MUST provide a shared convention for application-facing service results and safe service errors.
(Previously: error codes did not include `foreign-key-conflict`)

#### Scenario: Service operation returns typed success

- GIVEN a future feature service completes a backend-backed operation successfully
- WHEN the service returns to application callers
- THEN it MUST return a typed success result that contains the operation data or an explicit empty success value
- AND callers MUST be able to distinguish success from failure without inspecting raw SDK responses

#### Scenario: Service operation returns safe failure

- GIVEN a backend, SDK, configuration, validation, or property-scope failure occurs
- WHEN the service returns to application callers
- THEN it MUST return a typed failure result with a stable safe error code or message
- AND it MUST NOT expose access tokens, anon keys, JWTs, private keys, raw backend payloads, or raw SDK error objects to UI-facing callers

#### Scenario: Error mapping is reusable

- GIVEN multiple future feature services need to normalize backend failures
- WHEN they handle failed operations
- THEN they SHOULD use the shared service error/result convention instead of inventing incompatible per-feature result shapes

#### Scenario: foreign-key-conflict error code is available

- GIVEN a service operation attempts a physical DELETE that violates a foreign key constraint
- WHEN the service returns to callers
- THEN it MUST be able to return `"foreign-key-conflict"` as a valid `ServiceErrorCode`
- AND UI callers MUST be able to pattern-match on this code to display a user-friendly message

## Acceptance Criteria

- `ServiceErrorCode` union includes `"foreign-key-conflict"`.
- All existing error code behavior is preserved.
- `npm run build` passes with no type errors.
