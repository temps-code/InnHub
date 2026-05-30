# Proposal: feat(rooms): manage rooms and physical states

## Intent

Rooms exist in the database schema and seed data, but there is no UI or service to manage them. This change implements full CRUD for rooms with physical state management (available, occupied, cleaning, maintenance, inactive), following the established room-types pattern.

## Scope

### In Scope
- Service: `list`, `getById`, `create`, `update`, `softDelete` with property scoping
- Hook: `useRooms` with list state, create/edit/remove methods
- UI: RoomsPage with table, create/edit modal form, delete confirmation
- Form: FK select for `room_type_id` (loads room types from service), identifier, floor, state, description
- Filters: status, room_type_id, text search (identifier AND description)
- Soft delete gated to manager+ with active/future reservation check
- Role gating: administrator, manager, receptionist can change states
- i18n keys for rooms feature
- Tests: service, hook, page

### Out of Scope
- Recycle bin / purge (future change, reuse room-types pattern)
- State machine validation (any state can transition to any other)
- Bulk operations, audit log

## Capabilities

### New Capabilities
- `rooms`: CRUD for rooms with physical state management, FK relationship to room_types, property-scoped filtering, soft delete with reservation validation

### Modified Capabilities
None — this is a new feature module with no changes to existing spec behavior.

## Approach

1. **Types**: `Room` type + `roomFormSchema` (zod) with identifier, room_type_id, floor, state, description
2. **Service**: Follow `roomTypeService.ts` pattern exactly — `withServiceContext`, `scopeOperationalQuery`, `canAccess` for role gating. Add `softDelete` that checks for active/future reservations before setting `deleted_at`.
3. **Hook**: `useRooms` — loads rooms list, exposes create/edit/remove, handles loading/error/empty states. Loads room types list once for FK select options.
4. **UI**: `RoomsPage.tsx` — `PageSection` + table (identifier, type, floor, state badge, description), filter bar (status dropdown, room type dropdown, text search), create/edit modal, delete confirmation. `StatusBadge` with tones: success (available), info (occupied), warning (cleaning), danger (maintenance), neutral (inactive).
5. **Tests**: Fake query builder for service, mock service for hook, Testing Library for page.

### Key Decisions
- **Load room types**: Import `list` from `roomTypeService` — call on mount for FK select options
- **No state machine**: Any state → any state (per business rules)
- **Search**: Filter client-side by `identifier` AND `description` containing search text
- **Room type changeable**: Edit form allows changing `room_type_id`
- **Soft delete validation**: Query reservations table for active/future reservations referencing the room before allowing soft delete
- **Identifier uniqueness**: Enforced by DB partial unique index `(property_id, identifier) WHERE deleted_at IS NULL`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/rooms/types.ts` | New | Room type + form schema |
| `src/features/rooms/roomService.ts` | New | CRUD service following roomTypeService pattern |
| `src/features/rooms/useRooms.ts` | New | Hook with list, create/edit/remove |
| `src/features/rooms/RoomsPage.tsx` | New | Page with table, filters, modals |
| `src/features/rooms/index.ts` | New | Public exports |
| `src/features/rooms/__tests__/roomService.test.ts` | New | Service tests |
| `src/features/rooms/__tests__/useRooms.test.ts` | New | Hook tests |
| `src/features/rooms/__tests__/RoomsPage.test.tsx` | New | Page tests |
| `src/shared/i18n/resources/en.ts` | Modified | Add rooms i18n keys |
| `src/shared/i18n/resources/es.ts` | Modified | Add rooms i18n keys |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Room type FK select loads stale data | Low | Load room types on mount, single read |
| Soft delete reservation check misses edge cases | Medium | Query reservations with `status IN ('confirmed','checked_in') AND check_out > NOW()` |
| Identifier uniqueness violation on create | Low | DB partial unique index catches, surface as validation error |
| Filter state sync with URL | Low | Keep filters local to page (no URL state for MVP) |

## Rollback Plan

- Revert all new files under `src/features/rooms/`
- Revert i18n additions
- No DB schema changes (rooms table already exists)

## Dependencies

- Room types feature (for FK select data)
- Shared service layer (`withServiceContext`, `scopeOperationalQuery`, `canAccess`)
- Shared UI (`StatusBadge`, `Modal`, `ConfirmDialog`, `FormField`, `PageSection`)
- `ConfirmDialog` for delete confirmation
- `canAccess()` from routeMetadata for role gating

## Success Criteria

- [ ] Room list renders for active property with loading, empty, error states
- [ ] Create/edit forms validate and persist through service
- [ ] Room type FK select loads available room types
- [ ] Status filter, room type filter, and text search work
- [ ] `StatusBadge` renders correct tones for each physical state
- [ ] Soft delete gated to manager+ with confirmation modal
- [ ] Soft delete blocked when room has active/future reservations
- [ ] Identifier uniqueness enforced (duplicate rejected with error)
- [ ] All operations scoped to session property_id
- [ ] Tests pass, `npm run build` passes
