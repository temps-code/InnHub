# Apply Progress — PR1 (service/types/tests)

## Scope
Implemented PR1-only backend/service slice for `issue-14-reservations-management`:
- reservation types/contracts;
- reservation service logic (active list/create/edit/cancel + trash/soft-delete/restore/purge);
- reservation service test suite;
- exports wiring in reservations index.

No UI/hook/route/i18n/prototype work was implemented.

## Completed tasks
- [x] T1 RED reservation service tests
- [x] T2 reservation domain types and service contracts
- [x] T3 active list/create/edit/cancel service logic with issue #15 availability reuse
- [x] T4 archive/trash list + soft delete + restore + purge service logic
- [x] T5 triangulate/refactor edge tests and normalized errors

## Files changed
- `src/features/reservations/types.ts` (new)
- `src/features/reservations/reservationService.ts` (new)
- `src/features/reservations/__tests__/reservationService.test.ts` (new)
- `src/features/reservations/index.ts` (modified exports)
- `openspec/changes/issue-14-reservations-management/tasks.md` (PR1 checkboxes)

## TDD Cycle Evidence

| Cycle | Evidence |
|---|---|
| RED | `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` failed with module-not-found for `reservationService` (7 failing tests). |
| GREEN | Implemented `types.ts` + `reservationService.ts`; reran `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` and got passing tests. |
| TRIANGULATE | Added edge cases for active check-in soft-delete block and purge active-record rejection; reran focused test file (8 passing tests). |
| REFACTOR | Consolidated helper normalization/pagination/filter functions inside service and kept property scope + role checks centralized. |

## Commands run
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` (RED fail)
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` (GREEN pass)
- `npm run test:run` (pass: 51 files, 579 tests)
- `npm run lint` (pass)
- `npm run build` (pass)

## Design deviations / notes
- Trash list uses property-scoped fetch plus post-filter `deleted_at !== null` and avoids `.neq("deleted_at", null)`.
- Restore includes availability recheck using `validateRoomAvailability` when a primary reservation item has assigned room.
- Purge blocker counts currently derive from scoped invoice rows and scoped payment rows (matching test contracts), then return `foreign-key-conflict` with counts in message.

## Workload / PR boundary
- Estimated changed lines in this slice exceed 400-line review target materially (service + tests are large).
- Recommendation: split PR1 into reviewable commits/work-units (service contracts, lifecycle logic, purge guards/tests) even if still one slice artifact.

## PR1 blocker-fix micro-cycle (post-review)

### Completed blocker fixes
- [x] Persisted reservation item updates during `update()` (`room_type_id`, `room_id`, `guest_count`, `notes`) on primary item row.
- [x] Implemented list-level date filters (`checkInFrom/checkInTo/checkOutFrom/checkOutTo`) in service filtering.
- [x] Fixed `room_id` filter to resolve through `reservation_items.reservation_id` instead of filtering `reservations.room_id`.
- [x] Fixed trash pagination ordering: post-filter archived records first (`deleted_at !== null`), then paginate.
- [x] Fixed purge payment blocker counting to filter payments by invoice IDs linked to the reservation (`invoice_id IN (...)`).
- [x] Added targeted tests for these blocker paths.

### TDD evidence (blocker-fix cycle)

| Cycle | Evidence |
|---|---|
| RED | Added targeted tests (update persists item fields, date+room filters, trash pagination order, purge payment linkage). |
| GREEN | Implemented service fixes in `reservationService.ts`; focused tests pass: `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` (10 passing tests). |
| TRIANGULATE | Strengthened assertions for total counts and `payments.invoice_id` linkage query. |
| REFACTOR | Centralized array filtering/pagination helpers for list/trash flows while preserving property scope. |

### Updated command results
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` (pass: 10 tests)
- `npm run test:run` (pass: 51 files, 581 tests)
- `npm run lint` (pass)
- `npm run build` (pass)

## Remaining for later slices
- PR2 UI/hook/route/i18n/icons
- PR3 recycle-bin UX dialogs/flows
- PR4 prototype polish/panels

## PR1 final blocker-fix micro-cycle (rereview)

### Completed blocker fix
- [x] `update()` now checks the `reservation_items` update result and returns failure when item persistence fails.

### TDD evidence (final blocker-fix)

| Cycle | Evidence |
|---|---|
| RED | Added test `fails update when reservation item persistence fails` in `reservationService.test.ts`; focused run failed because service returned success (`result.ok === true`). |
| GREEN | Updated `update()` to capture item-update query result and return `serviceFailure("backend-error")` on failure; focused tests passed (11/11). |
| TRIANGULATE | Confirmed regression safety by running full suite after fix (582 passing tests). |
| REFACTOR | Kept change minimal to PR1 service/tests only; mirrored create-path error handling semantics. |

### Updated command results (final blocker-fix)
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` (RED fail, then GREEN pass: 11 tests)
- `npm run test:run` (pass: 51 files, 582 tests)
- `npm run lint` (pass)
- `npm run build` (pass)
