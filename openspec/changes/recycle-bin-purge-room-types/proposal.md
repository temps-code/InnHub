# Proposal: feat(admin): implement recycle bin and permanent purge for room types

## Intent

Room types use soft-delete (`deleted_at`) but there is no UI or service to view, restore, or permanently delete archived records. This change adds a recycle bin view with restore and purge capabilities.

## Scope

### In Scope
- Service: `listArchived`, `restore`, `purge` with property scoping and role gating
- FK check on purge: both `rooms` AND `reservation_items`
- New error code: `"foreign-key-conflict"` in `ServiceErrorCode`
- Hook: `showArchived` toggle, `restore(id)`, `purge(id)`
- UI: Toggle (admin/manager), archived table, restore/purge dialogs
- Duplicate name on restore: reject with error
- i18n: ~20 new keys per language
- Tests: Service, hook, UI

### Out of Scope
- Bulk operations, automatic cleanup, audit log, soft-delete behavior changes

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `room-types`: Add archive/purge requirements
- `service-layer`: Add `"foreign-key-conflict"` error code

## Approach

1. **Service**: `listArchived`, `restore`, `purge` using `withServiceContext` + `scopeOperationalQuery` + `canAccess("manager", role)`
2. **Hook**: Extend `useRoomTypes` with `showArchived` state, `restore`, `purge` — maintain "one hook per page"
3. **UI**: Toggle button, archived table, restore/purge dialogs, error handling
4. **Tests**: Fake query builder for service, mock service for hook, Testing Library for UI

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/services/serviceResult.ts` | Modified | Add error code |
| `src/features/room-types/roomTypeService.ts` | Modified | Add service functions |
| `src/features/room-types/useRoomTypes.ts` | Modified | Add archive state/methods |
| `src/features/room-types/RoomTypesPage.tsx` | Modified | Add UI |
| `src/shared/i18n/resources/en.ts` | Modified | Add keys |
| `src/shared/i18n/resources/es.ts` | Modified | Add keys |
| `src/features/room-types/__tests__/roomTypeService.test.ts` | Modified | Tests |
| `src/features/room-types/__tests__/useRoomTypes.test.ts` | Modified | Tests |
| `src/features/room-types/__tests__/RoomTypesPage.test.tsx` | Modified | Tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `listArchived` forgets property scoping | Medium | Use same pattern as `list` |
| Restore race condition | Low | PostgreSQL unique index catches |
| FK check misses `reservation_items` | Medium | Check both tables |
| Hook state refresh after restore/purge | Low | Call `load()` correctly |

## Rollback Plan

- Revert service, hook, page, error code, i18n changes
- No DB schema changes

## Dependencies

- Soft-delete implementation, shared service layer, `canAccess()`, `ConfirmDialog`

## Success Criteria

- [ ] Archived list renders for active property
- [ ] Toggle visible for admin/manager only
- [ ] Restore succeeds and type reappears
- [ ] Restore rejects duplicate name
- [ ] Purge succeeds when no FK references
- [ ] Purge rejects when rooms/reservations reference type
- [ ] Confirmation dialogs work
- [ ] All operations scoped to property_id
- [ ] Tests pass
- [ ] `npm run build` passes