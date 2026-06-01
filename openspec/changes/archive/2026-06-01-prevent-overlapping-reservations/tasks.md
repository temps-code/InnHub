# Tasks — prevent-overlapping-reservations (Issue #15)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 220–360 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Scope Guardrails

- Keep scope limited to backend/service-layer availability validation for same-room overlapping reservations.
- Do **not** implement full reservations CRUD/UI from issue #14.
- Keep DB concurrency hardening (locks/exclusion constraints) as documented follow-up only.

## Implementation Tasks (Strict TDD)

### 1) RED — Add overlap predicate + input-validation tests

- **Targets:**
  - `src/features/reservations/__tests__/reservationAvailability.rules.test.ts` (new)
  - `src/features/reservations/reservationAvailability.ts` (new, failing imports initially)
- **Add failing tests for:**
  - half-open overlap predicate (`requestedIn < existingOut && requestedOut > existingIn`)
  - same-day turnover allowed on both boundaries
  - exact overlap / partial overlap / containment rejected
  - invalid date order (`checkOut <= checkIn`) returns validation error
- **Acceptance mapping:** Half-Open Interval Semantics; edge-case coverage.

### 2) GREEN — Implement pure rules to satisfy task 1

- **Targets:**
  - `src/features/reservations/reservationAvailability.ts`
- **Implement:**
  - pure date-range overlap helper
  - request date-order guard
  - exported types used by service tests
- **Acceptance mapping:** overlap semantics + fast validation before backend calls.

### 3) RED — Add service-level failing tests for blockers and scoping

- **Targets:**
  - `src/features/reservations/__tests__/reservationAvailability.service.test.ts` (new)
- **Pattern reference for deps/mocks:**
  - `src/features/rooms/__tests__/roomService.test.ts`
  - `src/features/guests/__tests__/guestService.test.ts`
- **Add failing tests for:**
  - property scope required (`property-scope-error` before queries)
  - reservation-item + reservation-header blocker matrix
  - cancelled/no_show/pending are non-blocking
  - update self-exclusion by `excludeReservationItemId`
  - reservation-wide exclusion by `excludeReservationId`
  - active stay blocks; checked_out/cancelled stay do not
  - maintenance (`open|in_progress` + `blocks_availability=true`) blocks
  - resolved/cancelled or `blocks_availability=false` maintenance does not block
  - cross-property rows ignored via scoped queries
- **Acceptance mapping:** Service-Layer Overlap Prevention; status rules; self-exclusion; property scope; maintenance blockers.

### 4) GREEN — Implement availability service queries and validation flow

- **Targets:**
  - `src/features/reservations/reservationAvailability.ts`
  - `src/features/reservations/index.ts` (new/export if needed)
- **Implement:**
  - `validateRoomAvailability(session, request, deps?)`
  - internal blocker discovery against `reservation_items`, `reservations`, `stays`, `maintenance_tickets`
  - `withServiceContext` + `scopeOperationalQuery` on every query path
  - status filters and overlap filtering per design matrix
  - self-exclusion filters
  - `serviceSuccess`/`serviceFailure('validation-error', ...)` contract
- **Acceptance mapping:** all core service requirements.

### 5) TRIANGULATE — Expand tests for mixed-source conflicts and precedence

- **Targets:**
  - `src/features/reservations/__tests__/reservationAvailability.service.test.ts`
- **Add tests for:**
  - multiple simultaneous blockers (reservation + stay + maintenance)
  - no blockers returns success deterministically
  - blocker present in another property never blocks current request
- **Acceptance mapping:** deterministic service behavior and property isolation robustness.

### 6) REFACTOR — Stabilize types, fixtures, and error messages

- **Targets:**
  - `src/features/reservations/reservationAvailability.ts`
  - `src/features/reservations/__tests__/reservationAvailability*.test.ts`
  - optional `src/features/reservations/reservationTypes.ts` (new, only if needed)
- **Refactor goals:**
  - remove duplication in test fixtures/builders
  - keep blocker-source typing explicit
  - ensure messages/codes stay aligned with existing service conventions
- **Acceptance mapping:** maintainability without behavior change.

### 7) Verification and acceptance evidence

- **Commands:**
  - `npm run test:run`
  - `npm run lint`
  - `tsc -b`
- **Evidence to capture in apply/verify notes:**
  - failing-to-passing TDD progression
  - acceptance scenario mapping to test names
  - confirmation that validation is service/backend-facing (not UI-only)

## Acceptance-to-Task Traceability

- **Service-layer overlap prevention:** Tasks 3–4
- **Half-open intervals + same-day turnover:** Tasks 1–2
- **Blocking/non-blocking statuses:** Tasks 3–4
- **Update self-exclusion:** Tasks 3–4
- **Property-scoped checks:** Tasks 3–4, 5
- **Maintenance blockers semantics:** Tasks 3–4
- **Concurrency hardening out-of-scope note:** Scope Guardrails

## Delivery Decision

- Estimated workload fits a **single PR** under issue #15 scope.
- No chained PR required at current forecast.
- If implementation grows beyond ~400 changed lines, pause before apply for supervisor/user approval and split.
