# Proposal: feat(room-types): manage room types

## Intent

Room types (e.g., "Standard Queen") are category templates for physical rooms. DB schema and seed data exist; this change wires CRUD UI for room types scoped to the active property, with role-gated actions: list/view is open to `receptionist+` (role score ≥60), but create/edit is restricted to `administrator` (score 100) and optionally `manager` (score 80) since room type configuration (capacity, base_price) is room setup, not daily operations.

## Scope

### In Scope
- Room type list for active property with loading/empty/error states — accessible to `receptionist+` (≥60)
- Create/edit forms: name, description, capacity, base price — restricted to `administrator` (100) and optionally `manager` (80)
- Role-gated actions using `canAccess()` helper from routeMetadata
- Property-scoped access via `withServiceContext` + `scopeCurrentPropertyQuery`
- DB UNIQUE(property_id, name) enforced at service layer
- Swap `ModulePlaceholderPage` for `RoomTypesPage` in routes.tsx

### Out of Scope
- Deleting room types (ON DELETE RESTRICT in DB)
- Room management (Issue #12)
- Association display between room types and rooms

## Capabilities

### New Capabilities
- `room-types`: Full CRUD UI — list, create, edit. Service layer, types/Zod schema, hook, and page following established `properties/` pattern.

### Modified Capabilities
- `app-routing`: Swap `ModulePlaceholderPage` for `RoomTypesPage` in routes.tsx.

## Approach

Follow established `properties/` feature pattern, but evaluate what to extract as reusable abstractions given that rooms (#12), guests (#13), and reservations (#14) will follow the same CRUD pattern:

1. **types.ts** — `RoomType` type + `roomTypeFormSchema` (Zod: name required, capacity > 0, base_price > 0)
2. **roomTypeService.ts** — `list`, `getById`, `create`, `update` using shared helpers (`withServiceContext`, `scopeCurrentPropertyQuery`, `executeServiceQuery`)
3. **useRoomTypes.ts** — hook with `loading | loaded | error` state machine + stale-request protection
4. **RoomTypesPage.tsx** — list table always visible for `receptionist+`; create/edit buttons + form gated by `canAccess('administrator', userRole)` or `canAccess('manager', userRole)` 
5. **routes.tsx** — replace placeholder

**Reusability consideration**: the types→service→hook→page pattern repeats across features. The design phase will evaluate whether to extract a generic CRUD hook, service factory, or list layout before implementing — without over-abstracting prematurely.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/room-types/` | New | types, service, hook, page |
| `src/app/routes/routes.tsx` | Modified | Swap placeholder for page |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| InsForge client not configured locally | Low | Shared boundary returns safe error |
| DB UNIQUE violation becomes raw SDK error | Low | Map to "name already exists" message |
| Receptionist sees create/edit UI when they shouldn't | Low | Gate with `canAccess()` at render level, not just route level |

## Rollback Plan

- Revert routes.tsx to `ModulePlaceholderPage`
- Delete `src/features/room-types/`
- No DB schema changes — pure front-additive

## Dependencies

- InsForge client + `room_types` table seeded (done)
- Shared service layer (Issue #9, done)
- Property-scoped access helpers (Issue #7, done)

## Success Criteria

- [ ] Room types list renders from InsForge for active property
- [ ] `receptionist+` can see the list; create/edit buttons are hidden for unauthorized roles
- [ ] Create room type persists in DB and appears in list
- [ ] Edit updates the record and reflects in list
- [ ] Duplicate name shows clear validation error
- [ ] Loading, empty, and error states render safely
- [ ] `npm run build` passes with no type errors
