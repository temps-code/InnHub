# Design: issue-16-guest-check-in

## Overview

Issue #16 adds a bounded service-layer check-in operation for a single reservation item. The first implementation slice should stay in the reservations feature, coordinate existing property-scoped tables (`reservations`, `reservation_items`, `stays`, `rooms`), and avoid broad UI, checkout, billing, housekeeping, reports, or realtime work.

## Design Decisions

| Topic | Decision |
| --- | --- |
| Service location | Add `src/features/reservations/checkInService.ts` and export it from `src/features/reservations/index.ts`. This keeps reservation-item lifecycle logic near reservation services without creating a new broad feature folder. |
| Type location | Add check-in command/result and stay row types in `src/features/reservations/types.ts` or a small `checkInTypes.ts` if `types.ts` grows too much. Keep public exports under the reservations feature barrel. |
| Public API | `checkInReservationItem(session, command, deps?)`. The session supplies property scope and permissions; callers never provide trusted `property_id`. |
| UI scope | No required UI in the first implementation slice. Existing reservation screens may add a later action button/hook, but JSX must only call the service/hook and display results. |
| Date policy | Allow check-in when `actualCheckInAt` calendar date is `>= planned_check_in_date` and `< planned_check_out_date`. Reject attempts before arrival date or on/after planned check-out date. |
| Assignable room states | Only `available` is assignable for this slice. Reject `occupied`, `cleaning`, `maintenance`, and `inactive` to avoid checking a guest into a room that is not physically ready. |
| Retry behavior | Normal check-in requires item status `confirmed`. A completed retry may return success only when the same property/item/room already has an active stay, the item is already `checked_in`, the parent reservation is `partially_checked_in` or `checked_in`, and the room is already `occupied`. Conflicting existing stay data is rejected. |
| Transactions | Current service pattern exposes table queries, not a transaction API. Mutations should be ordered to support safe retry; DB transaction hardening is deferred unless InsForge exposes an atomic RPC/transaction mechanism during apply. |

## Public Service Contract

Proposed API:

```ts
export type CheckInReservationItemCommand = {
  readonly reservationItemId: string;
  readonly roomId?: string | null;
  readonly actualCheckInAt?: string;
};

export type CheckInReservationItemResult = {
  readonly reservation: Reservation;
  readonly reservationItem: ReservationItem;
  readonly stay: Stay;
  readonly room: Room;
};

export async function checkInReservationItem(
  session: AppSession | null,
  command: CheckInReservationItemCommand,
  deps?: CheckInServiceDeps,
): Promise<ServiceResult<CheckInReservationItemResult>>;
```

Contract details:

- `reservationItemId` is required and is the target lifecycle unit.
- `roomId` is optional; if provided it must equal the reservation item's assigned `room_id`. It is not a room-assignment feature.
- `actualCheckInAt` defaults to the current timestamp. Tests should inject it for determinism.
- Permission should require a valid active session with at least `receptionist` access, matching existing operational service conventions.
- Return `validation-error` for business-rule failures, `property-scope-error` for missing/mismatched scope, `not-found` for scoped missing records where useful, and `backend-error` for failed table operations.

## Data Flow

1. **Build service context**
   - Resolve `ctx.propertyScope` via `withServiceContext(session, ...)`.
   - Reject missing property scope before any query.
   - Reject missing or insufficient `session.profile` using `canAccess("receptionist", session.profile.role)`.

2. **Load reservation item**
   - Query `reservation_items` with `scopeOperationalQuery(..., ctx.propertyScope)`.
   - Filter by `id = command.reservationItemId` and `deleted_at IS NULL`.
   - Required columns: `id`, `property_id`, `reservation_id`, `room_type_id`, `room_id`, `status`, `guest_count`, `notes`, `deleted_at`.

3. **Load parent reservation**
   - Query `reservations` with the same property scope, `id = item.reservation_id`, and `deleted_at IS NULL`.
   - Required columns include `primary_guest_id`, planned dates, `status`, and timestamps.
   - Explicitly assert `reservation.property_id === ctx.propertyScope.propertyId` and `item.property_id === reservation.property_id` after loading, even though queries are scoped.

4. **Load assigned room**
   - Resolve `targetRoomId = command.roomId ?? item.room_id`.
   - Reject if no concrete room exists.
   - If `command.roomId` is present and differs from `item.room_id`, reject as `room-assignment-mismatch`.
   - Query `rooms` with property scope, `id = targetRoomId`, and `deleted_at IS NULL`.
   - Validate `room.property_id`, `room.room_type_id === item.room_type_id`, and `room.state === "available"` for normal check-in.

5. **Load existing stay for retry/conflict detection**
   - Query `stays` by property scope and `reservation_item_id = item.id`, excluding soft-deleted rows when the column is available.
   - No stay: proceed with first check-in.
   - One active stay with same property/item/room: allow retry continuation only if lifecycle state is otherwise compatible.
   - Any stay for a different room, property, item, non-active incompatible state, or duplicate-shaped result: reject and do not create another stay. The schema already has `UNIQUE(reservation_item_id)`, but service logic must still guard before insert.

6. **Validate lifecycle and dates before mutation**
   - Normal path requires `reservation.status` in `confirmed | partially_checked_in` and `item.status === confirmed`.
   - Completed idempotent path can return success when existing stay, checked-in item, checked-in/partial parent, and occupied same room all match.
   - Compute `actualCheckInDate = actualCheckInAt.slice(0, 10)` after validating/normalizing ISO input.
   - Require `planned_check_in_date <= actualCheckInDate < planned_check_out_date`.

7. **Create or reconcile stay**
   - Insert when no existing stay:
     - `property_id = ctx.propertyScope.propertyId`
     - `reservation_item_id = item.id`
     - `primary_guest_id = reservation.primary_guest_id`
     - `room_id = targetRoomId`
     - `actual_check_in_at = actualCheckInAt`
     - `expected_check_out_date = reservation.planned_check_out_date`
     - `status = active`
     - `guest_count = item.guest_count`
   - For a retry-safe existing active stay, update only fields needed to complete consistency (`status = active`, same room, expected check-out, guest count) without changing ownership.

8. **Update reservation item**
   - Update `reservation_items` scoped by property and id to `status = checked_in`.
   - Select the updated row for the result.

9. **Derive parent reservation status**
   - Load all non-deleted sibling items for the reservation under the same property scope.
   - Ignore siblings with `cancelled` or `no_show` for full-arrival derivation.
   - Treat the just-updated item as `checked_in` even if the sibling query returns stale data in tests/mocks.
   - If every non-cancelled/non-no-show item is `checked_in`, set reservation status to `checked_in`; otherwise set it to `partially_checked_in`.

10. **Update room physical state last**
    - Update only the scoped assigned room to `state = occupied`.
    - Keeping room mutation last avoids marking a room occupied before the stay/item lifecycle exists. If a later mutation fails, retry can reconcile from the active stay.

11. **Return updated records**
    - Return updated reservation, reservation item, stay, and room. If a scoped update returns no row, normalize to a safe service failure.

## Property-Scope Validation

Every read and mutation must use `scopeOperationalQuery(..., ctx.propertyScope)` for operational tables. The service must not trust `property_id` in the command. It should also perform explicit record-level assertions after loading:

- reservation item property equals session property;
- reservation property equals session property;
- reservation item points to the loaded reservation;
- room property equals session property;
- existing stay property equals session property;
- mutation filters include `property_id` and the target `id`/`reservation_item_id`.

Database constraints and RLS already reinforce this, but service tests must prove the feature applies its own scoped queries and never mutates cross-property rows in the fake data layer.

## Validation Matrix

| Validation | Rule | Failure message suggestion |
| --- | --- | --- |
| Session scope | Session must provide a property id | default `property-scope-error` |
| Permission | User profile can access receptionist workflows | `permission-denied` |
| Item existence | Scoped reservation item exists and is not deleted | `not-found` |
| Parent reservation | Scoped parent exists and is not deleted | `not-found` |
| Reservation status | `confirmed` or `partially_checked_in` for normal path | `reservation-not-check-in-eligible` |
| Item status | `confirmed` for normal path | `reservation-item-not-check-in-eligible` |
| Date window | actual date is on/after check-in and before check-out | `check-in-outside-planned-window` |
| Assigned room | item has a concrete assigned room | `assigned-room-required` |
| Explicit room | optional command room equals item room | `room-assignment-mismatch` |
| Room existence/scope | room exists in current property and is not deleted | `assigned-room-not-found` |
| Room type | room type equals reservation item room type | `room-type-mismatch` |
| Room state | room is `available` for normal check-in | `room-not-assignable-for-check-in` |
| Existing stay | no conflicting stay for item | `conflicting-stay-for-reservation-item` |

## Partial vs Full Reservation Status

Status derivation is item-based, not room-based:

- A single-item reservation becomes `checked_in` after that item is checked in.
- A group reservation becomes `partially_checked_in` while at least one non-cancelled/non-`no_show` sibling remains not checked in.
- A group reservation becomes `checked_in` when all non-cancelled/non-`no_show` siblings are `checked_in`.
- Cancelled and no-show items are ignored only for the parent full-status calculation; they are never checked in by this service.

## Strict TDD Test Plan

Use `npm run test:run` and record RED, GREEN, TRIANGULATE, and REFACTOR evidence during apply.

### RED

Add failing service tests before implementation in `src/features/reservations/__tests__/checkInService.test.ts`:

1. successful single-item check-in creates an active stay, sets item `checked_in`, reservation `checked_in`, and room `occupied`;
2. rejects missing property scope before queries;
3. rejects insufficient role;
4. rejects non-confirmed item and non-eligible reservation statuses without mutations;
5. rejects check-in before planned check-in and on/after planned check-out;
6. rejects missing assigned room and explicit room mismatch;
7. rejects cross-property item/reservation/room through scoped fake queries;
8. rejects room type mismatch;
9. rejects room states `occupied`, `cleaning`, `maintenance`, and `inactive`;
10. rejects conflicting existing stay and does not create a duplicate.

### GREEN

Implement the smallest service, helpers, and type exports needed to pass RED tests. Use a fake query/deps pattern similar to existing reservation availability and room service tests, extended to record inserts/updates and scoped filters.

### TRIANGULATE

Add group-reservation cases after the basic path passes:

1. two confirmed items: first check-in sets parent to `partially_checked_in`;
2. final eligible item check-in sets parent to `checked_in`;
3. cancelled/no-show siblings do not block full `checked_in`;
4. idempotent completed retry returns success for the same active stay/item/room and does not insert another stay.

### REFACTOR

Extract pure helpers only after tests prove behavior:

- `isReservationCheckInEligible(status)`;
- `isReservationItemCheckInEligible(status)`;
- `isRoomAssignableForCheckIn(state)`;
- `isCheckInWithinPlannedWindow(actualDate, plannedIn, plannedOut)`;
- `deriveReservationStatusAfterItemCheckIn(items, checkedItemId)`.

Keep helpers in `checkInService.ts` unless reuse becomes clear; avoid premature shared abstractions.

## UI and Route Touchpoints

No route changes are required for the first service slice. If a later task adds UI:

- touch `src/features/reservations/ReservationsPage.tsx` only minimally;
- show check-in action only for confirmed items/reservations, but do not duplicate service validation in JSX;
- call a typed hook/service wrapper and refresh reservation data after success;
- add i18n copy for button/error labels in both English and Spanish resources if user-facing text changes.

## File Change Forecast

Expected implementation files:

- `src/features/reservations/checkInService.ts` — new service and small pure helpers;
- `src/features/reservations/types.ts` or `checkInTypes.ts` — DTO/result/stay type exports;
- `src/features/reservations/index.ts` — export service/types;
- `src/features/reservations/__tests__/checkInService.test.ts` — strict TDD service tests.

No schema changes are expected because `stays`, status enums, unique stay-per-item constraint, rooms, reservations, and reservation items already exist.

## Review Workload Forecast

Forecast: **medium risk**, likely near but under the 400 changed-line budget if kept to service + tests.

- Service/helpers/types: ~170-220 changed lines.
- Tests/fake deps: ~220-300 changed lines.
- Barrel exports: small.
- No UI: avoids exceeding budget.

Total forecast may reach **400-520 lines** depending on test helper size. If tasks estimate or actual apply diff exceeds 400 changed lines, recommend slicing into chained work units:

1. **PR 1: service contract + core successful/rejection tests** — no UI, no group retry extras.
2. **PR 2: group status derivation + idempotent retry tests** — builds on PR 1.
3. **PR 3: optional UI trigger** — only if later approved.

Given the user preference is auto until tasks then pause before apply, the next SDD tasks phase should make the final delivery decision before implementation.

## Rollout and Rollback

Rollout is service-only and can ship without visible UI. Existing reservation creation and availability behavior should remain unchanged. Rollback is a clean revert of the new check-in service/types/tests/export; no database rollback is required.

## Non-Goals

- checkout;
- housekeeping task creation;
- billing/invoice/payment changes;
- reports/dashboard metrics;
- realtime subscriptions;
- walk-in stay creation;
- broad reservation UI redesign;
- backend replacement or transaction/RPC migration.
