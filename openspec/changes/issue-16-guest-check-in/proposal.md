# Proposal: feat(checkin): execute guest check-in

## Problem Statement

InnHub can create property-scoped reservations and prevent overlapping room assignments, but the operational arrival workflow is not yet implemented. Receptionists need a service-layer check-in operation that converts a valid confirmed reservation item into an active stay, updates reservation lifecycle state consistently, and marks the assigned physical room as occupied without relying on JSX-only validation.

## Intent

Implement GitHub issue #16 by adding a property-scoped guest check-in capability for confirmed reservation items. The change should coordinate `reservations`, `reservation_items`, `stays`, and `rooms` through tested service logic so actual occupation is represented by an active stay while room state reflects current physical occupancy.

## Issue Metadata

- GitHub issue: #16
- Title: `feat(checkin): execute guest check-in`
- Change id: `issue-16-guest-check-in`
- Prior phase context: repository root `init.md`
- Dependencies completed: issue #14 reservations, issue #15 availability overlap validation, properties, room types, rooms, guests
- Strict TDD: active
- Test runner: `npm run test:run`
- Execution preference: auto until tasks, then pause for user approval before apply
- Artifact store: OpenSpec only
- Review budget guard: 400 changed lines
- Skill resolution: paths-injected

## Scope

### In Scope

- Add a check-in service operation for a single confirmed reservation item.
- Validate that the reservation and reservation item belong to the active session property.
- Validate that the reservation and item are in check-in-eligible states:
  - reservation: `confirmed` or `partially_checked_in` when checking in another confirmed item from the same reservation;
  - reservation item: `confirmed`.
- Validate date rules for arrival, including rejecting check-in attempts outside the planned stay window unless a later spec/design phase explicitly narrows or expands the policy.
- Validate that the reservation item has, or can use, a concrete assigned room before check-in.
- Validate room existence, property match, room type match, and assignable physical state.
- Reject rooms that are `occupied`, `maintenance`, or `inactive`; the implementation may also reject other non-assignable states such as `cleaning` unless design explicitly allows them.
- Create a new `stays` row when no stay exists for the reservation item.
- Update an existing stay consistently only for idempotent/retry-safe behavior where the existing row belongs to the same property/item and can still represent the active occupation.
- Set the stay to `active`, preserve the reservation item link, room, property, actual check-in timestamp, and expected check-out date.
- Update the checked-in reservation item status to `checked_in`.
- Update the reservation status to:
  - `partially_checked_in` when only some active items are checked in;
  - `checked_in` when all non-cancelled/non-no-show reservation items are checked in.
- Update the assigned room state to `occupied`.
- Keep all data access and lifecycle validation in feature services/business rules, not React components.
- Add strict TDD coverage before implementation during apply, recording RED, GREEN, TRIANGULATE, and REFACTOR evidence.

### Out of Scope

- Check-out workflow and housekeeping task creation.
- Walk-in stay creation unrelated to an existing reservation item.
- Billing, invoice, or payment automation at check-in.
- Broad reservation management UI rewrites.
- Database backend replacement or new external services.
- Full concurrency/transaction hardening beyond the current InsForge service pattern, unless design confirms an available transaction mechanism.
- Permanent changes to future-reservation availability rules from issue #15, except where needed to recognize checked-in items/stays consistently.

## Affected Areas

| Area | Impact | Description |
| --- | --- | --- |
| `src/features/reservations/types.ts` | Modified | Add check-in DTOs/results and stay-related types if no dedicated check-in feature type file is introduced. |
| `src/features/reservations/reservationService.ts` or `src/features/check-in/*` | Modified/New | Add property-scoped check-in service logic, validation, status updates, stay creation/update, and room state mutation. |
| `src/features/reservations/reservationAvailability.ts` | Possibly modified | Ensure active stays and checked-in reservation states remain aligned with existing availability blocking semantics. |
| `src/features/reservations/__tests__/*` or `src/features/check-in/__tests__/*` | New/Modified | Strict TDD service tests for valid check-in, partial/full reservation status transitions, rejection cases, property isolation, and idempotency/error behavior. |
| `src/shared/services/propertyScope.ts` / `serviceContext.ts` | Reuse | Continue using active session property scope; no caller-provided property ownership should be trusted. |
| `rooms` service/types | Possibly modified | Reuse or align room state update behavior where needed; avoid duplicating unrelated room-management workflows. |
| UI/hooks/i18n | Optional/follow-up | Only add minimal UI-facing hook/copy if tasks/design decide this slice includes a trigger surface; service logic is the required core. |
| OpenSpec artifacts | New | Follow-up spec, design, and tasks must define detailed scenarios, tradeoffs, review forecast, and TDD evidence expectations. |

## Approach

1. **Define the check-in command contract**
   - Prefer a small typed input such as reservation item id, optional explicit room id, and optional check-in timestamp.
   - Derive `property_id` from the active session and reject payload/session mismatches.
   - Return a typed `ServiceResult` containing the updated reservation, reservation item, stay, and room state summary where feasible.

2. **Validate source records before mutation**
   - Load the reservation item with property scope.
   - Load its reservation with the same property scope.
   - Load the assigned/selected room with the same property scope.
   - Verify room type compatibility when the item has a `room_type_id`.
   - Reject deleted, cancelled, no-show, pending, already-invalid, cross-property, or missing records.

3. **Coordinate lifecycle mutations**
   - Create or reconcile the one-stay-per-reservation-item occupation record.
   - Mark the reservation item `checked_in`.
   - Compute the parent reservation status from all non-cancelled/non-no-show items.
   - Set the room physical state to `occupied` only for the assigned room.
   - Normalize backend failures into safe service errors.

4. **Strict TDD application plan**
   - RED: write service tests for valid confirmed item check-in and all acceptance rejection cases.
   - GREEN: implement the minimal service path to pass the tests.
   - TRIANGULATE: add group reservation scenarios proving partial then full check-in transitions.
   - REFACTOR: extract pure validation/status helpers where duplication appears, keeping business rules outside JSX.
   - Required command evidence: `npm run test:run`; for TypeScript/app changes, also collect lint/build evidence during apply/verify as appropriate.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Multi-table updates can partially fail without transactions | Medium | Design the mutation order carefully, normalize failures, add tests around failed update paths, and document DB transaction hardening if InsForge cannot provide atomic writes. |
| Group reservations produce incorrect parent status | Medium | Test one item checked in vs all eligible items checked in and compute status from item state. |
| Cross-property references leak through related records | Medium | Scope every read/mutation and use property-scope helpers plus explicit property-match assertions. |
| Room state conflicts with current availability semantics | Medium | Keep future reservations separate from physical room state; only actual check-in sets `occupied`. |
| Already checked-in/idempotent retry behavior is ambiguous | Medium | Resolve in spec/design; likely allow same-item active stay retry only when all linked records match, otherwise reject. |
| Scope exceeds 400 changed lines if UI is added | Medium | Prioritize service + tests as the first work unit; recommend chained PR slicing if tasks forecast exceeds the budget. |

## Rollback Plan

- Revert check-in service/type/test files added for issue #16.
- Revert any reservation availability/status helper adjustments made solely for check-in.
- Revert any optional hook/UI/i18n additions if included in later phases.
- No schema rollback is expected unless later design/apply phases approve migrations.
- Existing issue #14 reservations and issue #15 availability overlap behavior should remain intact.

## Success Criteria

- [ ] Only confirmed, property-scoped reservation items from valid check-in-eligible reservations can be checked in.
- [ ] Invalid rooms, dates, statuses, deleted records, missing assignments, room type mismatches, occupied/maintenance/inactive rooms, and property mismatches are rejected by service logic.
- [ ] Check-in creates or safely reconciles one active stay for the reservation item.
- [ ] Reservation item status changes to `checked_in`.
- [ ] Parent reservation status changes to `partially_checked_in` or `checked_in` consistently based on sibling item states.
- [ ] Assigned room state changes to `occupied` only after a valid check-in.
- [ ] Components, if any are added later, call typed services/hooks rather than implementing business rules in JSX.
- [ ] Strict TDD evidence is recorded for RED, GREEN, TRIANGULATE, and REFACTOR.
- [ ] `npm run test:run` passes during apply/verify, with lint/build evidence collected when code changes affect the app.
