# Design — prevent-overlapping-reservations

## Context

Issue #15 adds backend/service-facing availability validation for concrete room assignments. The current schema already contains the required reservation, reservation item, stay, and maintenance records, but `src/features/reservations` has no service baseline. This change should therefore add only the minimal service scaffolding needed to validate availability and leave the full #14 reservation CRUD/UI flow to its own change.

## Source of Truth

Availability must be derived from records scoped to the active `property_id`; callers must not provide or override property scope.

### Reservation blockers

The concrete room assignment lives on `reservation_items.room_id`; the planned date range lives on the parent `reservations` header. A reservation blocker is therefore the join/paired evaluation of:

- `reservation_items.property_id = session.propertyId`
- `reservation_items.room_id = requested.roomId`
- `reservation_items.reservation_id = reservations.id`
- `reservations.property_id = session.propertyId`
- item status and header status are both blocking (see matrix below)
- reservation header dates overlap the requested dates

Reservation headers alone are not a concrete room blocker because they do not contain `room_id`. Reservation items with `room_id = null` represent category-level demand and are out of scope for this same-room conflict check.

### Stay blockers

`stays` are the source of truth for actual room occupation, including walk-ins and checked-in reservations. Active stays must be considered separately because a stay can exist with or without a reservation item.

Use:

- `stays.property_id = session.propertyId`
- `stays.room_id = requested.roomId`
- `stays.status = 'active'`
- stay interval overlaps the requested dates

### Maintenance blockers

`maintenance_tickets` are the source of truth for maintenance availability blocks. Current schema has no planned maintenance start/end date fields; only `created_at`, `resolved_at`, `status`, and `blocks_availability`. Therefore, for this change an unresolved blocking ticket means the room is unavailable from the ticket creation date until it is resolved/cancelled.

Use:

- `maintenance_tickets.property_id = session.propertyId`
- `maintenance_tickets.room_id = requested.roomId`
- `maintenance_tickets.blocks_availability = true`
- `maintenance_tickets.status IN ('open', 'in_progress')`
- effective interval `[created_at::date, infinity)` overlaps the requested dates

Resolved or cancelled tickets do not block new availability checks even if their historical timestamps overlap the requested range.

## Status and Date Matrix

| Source | Blocking statuses | Non-blocking statuses | Date fields | Interval |
| --- | --- | --- | --- | --- |
| `reservations` header | `confirmed`, `partially_checked_in`, `checked_in` | `pending`, `cancelled`, `no_show` | `planned_check_in_date`, `planned_check_out_date` | `[planned_check_in_date, planned_check_out_date)` |
| `reservation_items` | `confirmed`, `checked_in` | `pending`, `cancelled`, `no_show` | inherited from parent header | inherited from parent header |
| `stays` | `active` | `checked_out`, `cancelled` | `actual_check_in_at::date`, `expected_check_out_date` | `[actual_check_in_at::date, expected_check_out_date)` |
| `maintenance_tickets` | `open`, `in_progress` AND `blocks_availability = true` | `resolved`, `cancelled`, or `blocks_availability = false` | `created_at::date`; no planned end date in schema | `[created_at::date, infinity)` while unresolved |

A reservation-item blocker requires both the item and parent header to be in blocking states. This avoids cancelled/no-show headers blocking through stale child items, and avoids pending items blocking before the business commits the room.

## Overlap Predicate

Use half-open date intervals: `[check_in, check_out)`.

```ts
requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn
```

Consequences:

- Existing checkout on `D` and requested check-in on `D` is allowed for planned reservations.
- Partial overlap, exact matching dates, and full containment are rejected.
- `requestedCheckOut` must be strictly after `requestedCheckIn`; rely on the existing DB check for persisted reservations and also validate in service input for fast feedback.

For open-ended maintenance, treat `existingCheckOut` as unbounded; in query terms, unresolved blocking maintenance conflicts when the requested checkout is after the ticket creation date.

## Service API Shape

Add minimal reservation availability scaffolding under `src/features/reservations/**`:

- `reservationAvailability.ts` or `reservationAvailabilityService.ts`
- `reservationTypes.ts` only if needed for local types/constants
- `__tests__/reservationAvailability*.test.ts`

Proposed public service boundary:

```ts
type AvailabilityRequest = {
  roomId: string;
  checkInDate: string;  // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  excludeReservationItemId?: string;
  excludeReservationId?: string;
};

async function validateRoomAvailability(
  session: AppSession | null,
  request: AvailabilityRequest,
  deps?: ReservationAvailabilityDeps,
): Promise<ServiceResult<void>>;

async function findRoomAvailabilityBlockers(
  session: AppSession | null,
  request: AvailabilityRequest,
  deps?: ReservationAvailabilityDeps,
): Promise<ServiceResult<AvailabilityBlocker[]>>;
```

`validateRoomAvailability` should return `serviceSuccess(undefined)` when no blockers exist and `serviceFailure('validation-error', 'Room is not available for the requested dates')` when at least one blocker exists. `findRoomAvailabilityBlockers` is useful for tests and future UI messaging, but the apply phase can keep it internal if review workload requires a smaller surface.

`AvailabilityBlocker` should distinguish sources without leaking raw backend payloads:

```ts
type AvailabilityBlocker =
  | { source: 'reservation-item'; id: string; reservationId: string }
  | { source: 'stay'; id: string }
  | { source: 'maintenance-ticket'; id: string };
```

Minimal create/update scaffolding, if needed, should only call `validateRoomAvailability` before persisting a room assignment. Do not build complete reservation list/detail pages, forms, routes, or status transition workflows in this issue.

## Query Design

All queries must be built through `withServiceContext(session, ...)` and `scopeOperationalQuery(query, ctx.propertyScope)`.

### Reservation item query

Because InsForge/PostgREST query joins may be awkward in the existing service test pattern, the safe minimal design is a two-step query:

1. Query `reservation_items` scoped by property and room:
   - select `id, reservation_id, status, room_id`
   - `eq('room_id', request.roomId)`
   - `in('status', ['confirmed', 'checked_in'])`
   - if updating, exclude `excludeReservationItemId` when supported; otherwise post-filter by id.
2. Query `reservations` scoped by property for the candidate reservation ids:
   - select `id, status, planned_check_in_date, planned_check_out_date`
   - `in('id', reservationIds)`
   - `in('status', ['confirmed', 'partially_checked_in', 'checked_in'])`
   - date filters: `lt('planned_check_in_date', request.checkOutDate)` and `gt('planned_check_out_date', request.checkInDate)`
   - if updating an entire reservation, exclude `excludeReservationId` when supported; otherwise post-filter by id.

Return a blocker for each candidate item whose parent reservation survives the status/date filters. Do not add `.is('deleted_at', null)` to reservation tables unless a migration adds `deleted_at`; the current core schema does not define soft-delete columns for `reservations`, `reservation_items`, `stays`, or `maintenance_tickets`.

### Stay query

Query `stays` scoped by property:

- `eq('room_id', request.roomId)`
- `eq('status', 'active')`
- overlap filter equivalent to `actual_check_in_at::date < request.checkOutDate AND expected_check_out_date > request.checkInDate`

If the client query API cannot express `actual_check_in_at::date`, fetch active stays for the room and apply the pure overlap predicate in TypeScript after converting `actual_check_in_at.slice(0, 10)`. This is acceptable for MVP volumes and keeps the rule testable.

### Maintenance query

Query `maintenance_tickets` scoped by property:

- `eq('room_id', request.roomId)`
- `eq('blocks_availability', true)`
- `in('status', ['open', 'in_progress'])`

Then post-filter by `created_at.slice(0, 10) < request.checkOutDate` to represent `[created_at::date, infinity)`. There is no end-date field to compare until a future maintenance scheduling change adds one.

## Property-Scope Enforcement

- The request type must not include `propertyId`.
- `withServiceContext` rejects missing session property as `property-scope-error` before any query.
- Every query uses `scopeOperationalQuery` on the relevant table, including both sides of the reservation item/header pair.
- Tests should assert that reservation item, reservation header, stay, and maintenance queries each receive `eq('property_id', session.propertyId)`.
- Cross-property rows must never become blockers even if ids or room labels are similar.

## Update Self-Exclusion

Update paths must avoid self-conflict:

- `excludeReservationItemId` excludes the item being edited from reservation-item blockers.
- `excludeReservationId` excludes all items under the reservation when the operation updates the whole reservation header/date range.
- If InsForge query helpers support `.neq('id', value)`, use it for value exclusion only. If not, fetch candidates and post-filter. Do not use `.neq(..., null)` for null checks.
- Self-exclusion must not hide conflicts with other items in the same reservation unless the operation is intentionally rescheduling the whole reservation and passes `excludeReservationId`.

## TDD Strategy

Strict TDD uses `npm run test:run`.

1. Add pure unit tests for `rangesOverlap(requestedIn, requestedOut, existingIn, existingOut)` and date-order validation.
2. Add service tests with fake InsForge query dependencies matching current `roomService`/`guestService` patterns.
3. Make the service tests fail first for property scoping, status filtering, overlap detection, self-exclusion, and maintenance blockers.
4. Implement minimal service code until tests pass.
5. Run `npm run test:run`; run `npm run lint`/build if apply touches broader TypeScript surfaces.

Required edge-case tests:

- same-day turnover: existing checkout equals requested check-in is allowed;
- requested checkout equals existing check-in is allowed;
- exact same interval is rejected;
- requested interval overlaps existing start or end and is rejected;
- requested interval fully contains existing interval and is rejected;
- existing interval fully contains requested interval and is rejected;
- cancelled/no-show reservation header does not block;
- cancelled/no-show reservation item does not block;
- pending header/item does not block;
- checked-in/partially checked-in equivalents block according to the matrix;
- update excludes the current reservation item;
- update still rejects another conflicting item;
- whole-reservation date update can exclude all items from the same reservation when `excludeReservationId` is passed;
- active stay blocks, checked-out/cancelled stay does not;
- unresolved `blocks_availability = true` maintenance blocks;
- resolved/cancelled or `blocks_availability = false` maintenance does not block;
- missing property scope is rejected before queries;
- same room id under another property is ignored due to scoped queries;
- invalid date order returns `validation-error` before backend calls.

## Tradeoffs and Scope Boundaries

- **Service layer first:** This satisfies issue #15 and the OpenSpec requirement without waiting for complete #14 UI/CRUD. It is deterministic and testable, but it is not a substitute for database-level concurrency control.
- **No full #14 CRUD/UI:** Reservation screens, forms, routes, list/detail views, and comprehensive status transitions are follow-up work. This change may add only the smallest create/update hook point required to prove the validation path.
- **No DB concurrency hardening:** Exclusion constraints, advisory locks, serializable transactions, or trigger-based conflict prevention remain follow-up hardening. Without them, two concurrent creates can still race between validation and insert.
- **No category inventory blocking:** `reservation_items.room_id = null` is not checked for same-room overlap. Category-level inventory validation should be handled in a later availability/inventory change.
- **Maintenance has no scheduled dates:** Treating unresolved blocking tickets as open-ended is conservative and matches the current schema, but it can over-block future dates. Scheduled maintenance windows require a schema/spec follow-up.
- **No physical room state blocker in this issue:** ERD notes `rooms.state = maintenance/inactive` affects assignability, but the current change request focuses on reservation/stay/maintenance records. A future room-assignability guard can combine this availability service with room state checks if required.

## Review Workload Forecast

Keep the apply phase under the 400 changed-line review budget by limiting work to:

- one reservation availability service/rules file;
- one focused service test file;
- minimal type/constants definitions;
- optional tiny integration into reservation create/update scaffolding only if such scaffolding already exists or is necessary for acceptance.

Avoid adding UI, i18n, route, hook, dashboard, seed, or migration changes in this issue. If implementation requires more than roughly 250-350 changed lines before tests, pause and split the work or ask for approval before expanding scope.

## Rollout and Verification

- Apply behind the reservation service boundary; no UI rollout flag is needed because there is no UI behavior change in this design.
- Verify with `npm run test:run`.
- During review, confirm all blocker queries are property-scoped and no validation is JSX-only.
- Track follow-ups for DB-level hardening, category-level availability, scheduled maintenance windows, and full reservation CRUD/UI.
