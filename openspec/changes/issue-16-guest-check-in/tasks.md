# Tasks — `issue-16-guest-check-in`

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 420–560 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (core check-in contract + normal-path/rejection coverage) → PR 2 (group status + retry-safe reconciliation + availability alignment) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

---

## PR 1 — Core check-in service boundary

**Start:** reservations feature has no check-in service.
**Finish:** one reservation item can be checked in through a service-only boundary with normal-path and rejection coverage.
**Verify:** capture RED → GREEN evidence with `npm run test:run`, then `npm run lint`, then `npm run build`.
**Rollback:** revert `src/features/reservations/checkInService.ts`, `src/features/reservations/__tests__/checkInService.test.ts`, and related export/type additions.

- [x] **T1 (RED): Add failing core check-in service tests**  
  **Files:** `src/features/reservations/__tests__/checkInService.test.ts`  
  Add failing tests proving the service:
  - creates one active stay and returns updated `reservation`, `reservationItem`, `stay`, and `room` for a valid single-item check-in;
  - rejects missing property scope and insufficient role;
  - rejects ineligible reservation/item statuses;
  - rejects check-in before `planned_check_in_date` and on/after `planned_check_out_date`;
  - rejects missing assigned room, explicit `roomId` mismatch, room type mismatch, and room states `occupied`, `cleaning`, `maintenance`, `inactive`;
  - rejects cross-property reservation item, reservation, and room access without mutating data.
  **Evidence:** record the initial failing test run from `npm run test:run`.

- [x] **T2 (GREEN): Add check-in contract and exported types**  
  **Files:** `src/features/reservations/types.ts`, `src/features/reservations/index.ts`  
  Add `CheckInReservationItemCommand`, `CheckInReservationItemResult`, and any stay row/result typing needed by the tests; export them from the reservations barrel without adding UI-facing behavior.
  **Evidence:** GREEN only after T1 failures are already captured.

- [x] **T3 (GREEN): Implement the minimal check-in service**  
  **Files:** `src/features/reservations/checkInService.ts`, `src/features/reservations/index.ts`  
  Implement `checkInReservationItem(session, command, deps?)` with:
  - `withServiceContext`, `scopeOperationalQuery`, and `canAccess("receptionist", ...)`;
  - scoped loads for `reservation_items`, `reservations`, `rooms`, and `stays`;
  - normal-path stay insert/update ordering from the design;
  - reservation item status update to `checked_in`;
  - parent reservation status update for the single-item path;
  - room state update to `occupied` last;
  - normalized `property-scope-error`, `validation-error`, `not-found`, and `backend-error` results.
  **Evidence:** `npm run test:run` passes the T1 suite.

- [x] **T4 (REFACTOR): Extract small pure validation helpers after GREEN**  
  **Files:** `src/features/reservations/checkInService.ts`  
  Extract only helpers justified by passing tests, such as reservation/item eligibility, room assignability, and date-window checks; keep the helpers feature-local and business-rule-focused.
  **Evidence:** no behavior changes; rerun `npm run test:run` after the refactor.

---

## PR 2 — Group arrival derivation and retry-safe reconciliation

**Start:** core service exists and passes single-item/rejection tests.
**Finish:** grouped reservations, cancelled/no-show exclusions, and retry-safe existing stays are covered and implemented.
**Verify:** capture new RED → GREEN → TRIANGULATE → REFACTOR evidence with `npm run test:run`, then `npm run lint`, then `npm run build`.
**Rollback:** revert only the group/retry helper and test expansions, leaving the core service slice intact.

- [x] **T5 (RED): Add failing group-status and retry tests**  
  **Files:** `src/features/reservations/__tests__/checkInService.test.ts`  
  Add failing tests proving:
  - first check-in of a multi-item reservation sets parent status to `partially_checked_in`;
  - final eligible item check-in sets parent status to `checked_in`;
  - `cancelled` and `no_show` siblings do not block full `checked_in`;
  - retrying a completed check-in with the same property/item/room returns success without inserting another stay;
  - conflicting existing stay data is rejected without duplicate creation.
  **Evidence:** record the failing `npm run test:run` output before implementation.

- [x] **T6 (GREEN): Implement sibling-status derivation and retry-safe stay reconciliation**  
  **Files:** `src/features/reservations/checkInService.ts`  
  Extend the service to:
  - load sibling `reservation_items` for the parent reservation;
  - derive `partially_checked_in` vs `checked_in` from non-`cancelled`/non-`no_show` items;
  - allow idempotent success only for the exact existing active-stay + checked-in-item + occupied-room shape from the design;
  - reject conflicting stay ownership or room linkage.
  **Evidence:** `npm run test:run` passes the new group/retry suite.

- [x] **T7 (TRIANGULATE): Prove availability semantics stay aligned with occupied rooms**  
  **Files:** `src/features/reservations/__tests__/reservationAvailability.service.test.ts`, `src/features/reservations/reservationAvailability.ts`  
  Add or adjust focused tests only if needed to prove active stays and checked-in room occupancy continue to block overlapping availability correctly after check-in data exists.
  **Evidence:** record the added failing test first if code changes are required.

- [x] **T8 (REFACTOR): Normalize helper boundaries and fake deps for reviewability**  
  **Files:** `src/features/reservations/checkInService.ts`, `src/features/reservations/__tests__/checkInService.test.ts`  
  Refactor duplicated sibling/stay fixtures or helper logic only after GREEN/TRIANGULATE passes; keep tests readable and each fake query/mutation explicitly property-scoped.
  **Evidence:** rerun `npm run test:run` with no new failures.

---

## Verification tasks

- [x] **V1:** For each PR slice, capture RED evidence from `npm run test:run` before GREEN changes.
- [x] **V2:** After each GREEN/REFACTOR stage, run `npm run test:run` and record the passing result.
- [x] **V3:** Run `npm run lint` after each slice.
- [x] **V4:** Run `npm run build` after each slice.
- [x] **V5:** Record changed-line count per slice and keep each PR within the 400-line review budget; if a slice drifts over budget, pause before apply. PR1 size exception was explicitly approved by the owner; PR2 stayed near the approved slice boundary.
- [x] **V6:** Pause for user approval before `sdd-apply` because execution mode is auto until tasks only.

## Explicit deferrals

- [ ] UI buttons, hooks, route changes, and i18n for check-in triggers.
- [ ] Check-out, housekeeping creation, billing/payment behavior, and walk-in stays.
- [ ] Transaction/RPC hardening beyond the current service pattern unless backend capabilities change.
