# Proposal: feat(db): soft delete all tables + room types lifecycle

## Intent

No safe deletion path exists — physical `DELETE` loses audit trail and prevents recovery. This change adds `deleted_at` to all 13 tables, converts UNIQUE constraints to partial indexes (`WHERE deleted_at IS NULL`), and implements the first lifecycle in room types.

## Scope

### In Scope
- Migration 002: `deleted_at timestamptz` on all 13 tables (properties, profiles, guests, room_types, rooms, reservations, reservation_items, stays, stay_guests, housekeeping_tasks, maintenance_tickets, invoices, payments)
- Convert UNIQUE(property_id, name) on room_types, UNIQUE(property_id, identifier) on rooms, UNIQUE(property_id, email) on profiles to partial unique indexes `WHERE deleted_at IS NULL`
- Keep UNIQUE as-is for: properties.slug, invoices(property_id, invoice_number), stay_guests(stay_id, guest_id)
- Add (property_id, deleted_at) performance indexes for room_types, rooms, guests, profiles, reservations
- Room types lifecycle: `softDelete(session, id)` service, `remove(id)` hook callback, delete button per row (manager+), confirmation modal, `list`/`getById` filter `deleted_at IS NULL`
- TDD: extend `FakeRoomTypeQuery` with `.is()`, full service/hook/UI test coverage

### Out of Scope
- Soft delete lifecycle for other 12 tables (deferred to each feature's own change)
- Trash/recovery UI or restore functionality
- Cascade soft deletes across FK relationships
- Backend RLS policies for soft-delete visibility

## Capabilities

### New Capabilities
None — cross-cutting schema change plus feature lifecycle, not a standalone spec.

### Modified Capabilities
- `database-schema`: add `deleted_at` column to all 13 tables, convert UNIQUE constraints to partial unique indexes with `WHERE deleted_at IS NULL`, add (property_id, deleted_at) performance indexes
- `room-types`: add soft-delete lifecycle — softDelete service, remove() hook, delete button with confirmation modal, list/getById filtered to exclude soft-deleted records

## Approach

Two work units:

1. **DB migration** — `002_add_soft_delete.sql` adds `deleted_at`, drops + recreates 3 UNIQUE constraints as partial indexes, adds 5 performance indexes. `002_down.sql` reverts with documented duplicate-warning header.
2. **Room types lifecycle** — extend `RoomType` type with `deleted_at?`, add `softDelete()` to service (uses `session` → `eq("id", id).is("deleted_at", null).update(...)`), add `remove()` to hook, add delete button per row gated by `canAccess("manager")`, wire confirmation modal. `list`/`getById` append `.is("deleted_at", null)` to skip soft-deleted records. `update` guards against mutating soft-deleted records.

TDD sequence: types → service → hook → page.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations/002_add_soft_delete.sql` | New | Add deleted_at + partial indexes |
| `database/migrations/002_add_soft_delete.down.sql` | New | Rollback with duplicate warning |
| `src/features/room-types/roomTypeService.ts` | Modified | Add softDelete, filter list/getById, guard update |
| `src/features/room-types/useRoomTypes.ts` | Modified | Add remove() callback + refresh |
| `src/features/room-types/RoomTypesPage.tsx` | Modified | Delete button + confirmation modal |
| `src/features/room-types/types.ts` | Modified | Add `deleted_at: string \| null` |
| `src/features/room-types/__tests__/*` | Modified | Extend FakeRoomTypeQuery, add lifecycle tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Duplicates created after soft delete block partial-index-to-UNIQUE revert | Low | Document warning in down migration header |
| Manager deletes room type with active rooms | Low | FK + ON DELETE RESTRICT blocks it naturally |
| Existing tests reference full UNIQUE constraint | Low | Migration tests validate partial index creation; existing tests unaffected |

## Rollback Plan

1. Run `002_down.sql` — drops partial indexes, restores UNIQUE constraints, drops `deleted_at` column
2. Revert room-types files to pre-change state
3. `npm run build` + `npm run test:run` pass

**Warning**: If new records duplicate soft-deleted UNIQUE values, the down migration will fail. Restore from backup or resolve conflicts manually before reverting.

## Dependencies

None. Migration 001 exists. Room types feature exists. No external blockers.

## Success Criteria

- [ ] `npm run test:run` passes (existing + new TDD tests)
- [ ] `npm run build` passes with no type errors
- [ ] Soft-deleted room type disappears from list
- [ ] Soft-deleted room type still exists in DB (`deleted_at` set)
- [ ] Creating room type with same name as soft-deleted one succeeds
- [ ] Duplicate name among active records still rejected
- [ ] Delete button hidden for receptionist, visible for manager+
- [ ] Update request on soft-deleted record returns error
