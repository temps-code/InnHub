# Tasks: feat(admin): implement recycle bin and permanent purge for room types

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

| Unit | Goal | PR | ~Lines |
|------|------|----|--------|
| 1 | Error code + service + tests | PR 1 | 200 |
| 2 | Hook extension + tests | PR 2 | 120 |
| 3 | UI + i18n + tests | PR 3 | 250 |

## Phase 1: Error Code

- [x] 1.1 Add `"foreign-key-conflict"` to `ServiceErrorCode` in `src/shared/services/serviceResult.ts`
- [x] 1.2 Add default message to `defaultErrorMessages`
- [x] 1.3 Verify `npm run build` passes

## Phase 2: Service Layer

- [x] 2.1 Extend `RoomTypeServiceDepsQuery` with `neq()` and `delete()` in `roomTypeService.ts`
- [x] 2.2 `listArchived`: `.neq("deleted_at", null)`, scoped, gated manager+
- [x] 2.3 `restore`: load soft-deleted → check no duplicate active name → `deleted_at = null`
- [x] 2.4 `purge`: load soft-deleted → check `rooms` FK → check `reservation_items` FK → delete
- [x] 2.5 Export from `index.ts`

## Phase 3: Service Tests

- [x] 3.1 Add `neqCalls`/`deleteCalls` to `FakeRoomTypeQuery`
- [x] 3.2 `listArchived` tests: returns archived, `.neq` called, scoped, rejects low-role
- [x] 3.3 `restore` tests: success, duplicate→`validation-error`, non-deleted→`not-found`, wrong property, low-role
- [x] 3.4 `purge` tests: success, rooms FK→`foreign-key-conflict`, reservation_items FK, both, non-deleted, wrong property, low-role

## Phase 4: i18n

- [x] 4.1 Add `roomTypes.archive.*` (~20 keys) to `en.ts`
- [x] 4.2 Add matching keys to `es.ts`

## Phase 5: Hook

- [x] 5.1 Import `listArchived`, `restore`, `purge` from service
- [x] 5.2 Add `showArchived` state, branch `load()` on it
- [x] 5.3 Implement `toggleArchived()`, `restore(id)`, `purge(id)`
- [x] 5.4 Update `UseRoomTypesResult` type

## Phase 6: Hook Tests

- [x] 6.1 Mock `listArchived`, `restore`, `purge`
- [x] 6.2 `toggleArchived` switches service and data
- [x] 6.3 `refresh()` respects current mode
- [x] 6.4 `restore`/`purge` success and failure paths

## Phase 7: UI

- [x] 7.1 Destructure new hook returns, add archive state
- [x] 7.2 Toggle button (admin/manager only)
- [x] 7.3 Archived table: name, capacity, base_price, description, deleted_at, Restore/Purge buttons
- [x] 7.4 Restore confirm dialog with duplicate-name error slot
- [x] 7.5 Purge confirm dialog (`variant="danger"`) with FK-conflict error slot
- [x] 7.6 Map service errors to i18n messages

## Phase 8: UI Tests

- [x] 8.1 Toggle visible for admin, hidden for receptionist
- [x] 8.2 Toggle switches content, shows action buttons
- [x] 8.3 Empty archived state renders
- [x] 8.4 Restore dialog: open → confirm → close
- [x] 8.5 Restore duplicate-name error displays
- [x] 8.6 Purge dialog: open → confirm → close
- [x] 8.7 Purge FK conflict error displays
- [x] 8.8 Cancel dismisses without calling service
