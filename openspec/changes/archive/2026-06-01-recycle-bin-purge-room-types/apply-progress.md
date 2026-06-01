# Apply Progress: recycle-bin-purge-room-types

## PR 3 of 3 — UI + i18n + Tests

**Mode**: Strict TDD
**Date**: 2026-05-28
**Status**: Ready for verify

## Completed Tasks

### Phase 4: i18n (4.1-4.2) ✅

- [x] 4.1 Add `roomTypes.archive.*` (~20 keys) to `en.ts`
- [x] 4.2 Add matching keys to `es.ts`

### Phase 7: UI (7.1-7.6) ✅

- [x] 7.1 Destructure new hook returns, add archive state
- [x] 7.2 Toggle button (admin/manager only)
- [x] 7.3 Archived table: name, capacity, base_price, description, deleted_at, Restore/Purge buttons
- [x] 7.4 Restore confirm dialog with duplicate-name error slot
- [x] 7.5 Purge confirm dialog (`variant="danger"`) with FK-conflict error slot
- [x] 7.6 Map service errors to i18n messages

### Phase 8: UI Tests (8.1-8.8) ✅

- [x] 8.1 Toggle visible for admin, hidden for receptionist
- [x] 8.2 Toggle switches content, shows action buttons
- [x] 8.3 Empty archived state renders
- [x] 8.4 Restore dialog: open → confirm → close
- [x] 8.5 Restore duplicate-name error displays
- [x] 8.6 Purge dialog: open → confirm → close
- [x] 8.7 Purge FK conflict error displays
- [x] 8.8 Cancel dismisses without calling service

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/shared/i18n/resources/en.ts` | Modified | Added `roomTypes.archive.*` section with 15 keys (toggle, toggleActive, title, empty, restore, restoreConfirmTitle, restoreConfirmMessage, restoreSuccess, restoreDuplicateName, purge, purgeConfirmTitle, purgeConfirmMessage, purgeSuccess, purgeForeignKeyConflict) |
| `src/shared/i18n/resources/es.ts` | Modified | Added matching Spanish translations for all 15 archive keys |
| `src/features/room-types/RoomTypesPage.tsx` | Modified | Destructured `showArchived`, `toggleArchived`, `restore`, `purge` from hook; added `restoreConfirm`/`purgeConfirm`/`restoreError`/`purgeError`/`isRestoring`/`isPurging` state; added restore/purge handlers with error mapping; added archive toggle button (admin/manager only); added archived table with deleted_at column and Restore/Purge action buttons; added Restore ConfirmDialog (variant="primary") and Purge ConfirmDialog (variant="danger"); updated empty state to respect archive mode |
| `src/features/room-types/__tests__/RoomTypesPage.test.tsx` | Modified | Added `archivedRoomType` test data; 14 new tests across 5 describe blocks: archive toggle (4), archived table (2), restore flow (3), purge flow (3), cancel dismisses (2) |

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4.1-4.2 | `RoomTypesPage.test.tsx` | Integration | N/A (new data) | ✅ Written | ✅ Passed | ➖ Data-only | ✅ Clean |
| 7.1-7.6 | `RoomTypesPage.test.tsx` | Integration | ✅ 24/24 | ✅ Written | ✅ Passed | ✅ 14 cases | ✅ Clean |
| 8.1-8.8 | `RoomTypesPage.test.tsx` | Integration | N/A (tests are the deliverable) | ✅ Written | ✅ Passed | ✅ 14 cases | ➖ None needed |

### Test Summary
- **Total tests written**: 14 (new)
- **Total tests passing**: 391 (377 existing + 14 new)
- **Layers used**: Integration (14)
- **Approval tests**: None — no refactoring tasks
- **Pure functions created**: 0 (React component logic)

## Deviations from Design

None — implementation matches design.

## Issues Found

None.

## Remaining Tasks

All tasks complete. This is the final PR in the stack (PR 3 of 3).

## Status

**24/24 tasks complete** (all phases). Ready for verify. All PRs (1-3) are complete.
