# Design: feat(rooms): manage rooms and physical states

## Technical Approach

Mirror the `room-types` feature module exactly. Each layer (types, service, hook, page) follows the same conventions, patterns, and DI structure. The rooms service adds two room-specific behaviors: (1) a reservation check before soft delete, and (2) loading room types from `roomTypeService.list` for FK select options.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Soft delete reservation check | Query reservations table before delete vs. DB trigger | App-level check gives readable error messages; DB trigger is safer but opaque | App-level query: `status IN ('confirmed','checked_in') AND check_out > NOW()` |
| Room types loading for FK select | Import `list` from `roomTypeService` vs. duplicate fetch in hook | Single read on mount; no duplication | Import `list` from `roomTypeService` |
| Client-side filtering | Client-side post-filter vs. server-side query params | Simpler for MVP scale; no query builder changes | Client-side: filter `status`, `room_type_id`, `search` on loaded data |
| Search scope | Search identifier AND description vs. identifier only | Matches spec requirement | Client-side `.filter()` on both fields |
| State machine | Any-to-any vs. restricted transitions | Per business rules: no restrictions | Any state → any state |

## Data Flow

```
RoomsPage
  ├─ useRooms(session)          → loads rooms list + room types list
  │    ├─ roomService.list()    → filtered by session property_id
  │    └─ roomTypeService.list() → for FK select options
  ├─ Filter state (local)       → status, room_type_id, search
  ├─ Client-side filter         → applied on rooms state
  └─ Modals
       ├─ RoomFormModal         → create/edit via hook.create/update
       └─ ConfirmDialog         → delete via hook.remove
```

## Type Definitions

```ts
// src/features/rooms/types.ts
type RoomState = "available" | "occupied" | "cleaning" | "maintenance" | "inactive";

type Room = {
  readonly id: string;
  readonly property_id: string;
  readonly room_type_id: string;
  readonly identifier: string;
  readonly floor: string | null;
  readonly state: RoomState;
  readonly description: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
};

type RoomFormData = {
  identifier: string;
  room_type_id: string;
  floor: string;
  state: RoomState;
  description: string;
};

type RoomFilters = {
  status?: RoomState;
  room_type_id?: string;
  search?: string;
};

const ROOM_STATE_TONE_MAP: Record<RoomState, StatusBadgeTone> = {
  available: "success",
  occupied: "info",
  cleaning: "warning",
  maintenance: "danger",
  inactive: "neutral",
};
```

## Service Signatures

```ts
// src/features/rooms/roomService.ts
// Same deps pattern as roomTypeService: RoomServiceDeps, RoomServiceDepsQuery, RoomServiceDepsDeleteQuery

list(session, filters?: RoomFilters, deps?): Promise<ServiceResult<Room[]>>
  // scopeOperationalQuery + .is('deleted_at', null)
  // Client-side post-filter: status, room_type_id, search (identifier+description)

getById(session, id, deps?): Promise<ServiceResult<Room>>
  // scopeOperationalQuery + .is('deleted_at', null) + .eq('id', id)

create(session, data: RoomFormData, deps?): Promise<ServiceResult<Room>>
  // canAccess('receptionist', role) — admin, manager, receptionist can create
  // assignPropertyOwnership + insert + .select()
  // handleDatabaseError: 23505 → "A room with this identifier already exists."

update(session, id, data: RoomFormData, deps?): Promise<ServiceResult<Room>>
  // canAccess('receptionist', role)
  // scopeOperationalQuery + .is('deleted_at', null) + .eq('id', id) + update
  // 23505 → duplicate identifier message

softDelete(session, id, deps?): Promise<ServiceResult<Room>>
  // canAccess('manager', role) — manager+ only
  // Step 1: load room by id (must exist, must not be deleted)
  // Step 2: query reservations WHERE room_id = id AND status IN ('confirmed','checked_in') AND check_out > NOW()
  // Step 3: if any reservation found → serviceFailure('validation-error', 'Room has active reservations')
  // Step 4: update deleted_at = NOW()
```

## Hook: `useRooms`

```ts
// src/features/rooms/useRooms.ts
type RoomsState =
  | { status: "loading" }
  | { status: "loaded"; rooms: Room[] }
  | { status: "error"; error: ServiceError };

type UseRoomsResult = {
  state: RoomsState;
  roomTypes: RoomType[];           // loaded once on mount
  create: (data: RoomFormData) => Promise<void>;
  update: (id: string, data: RoomFormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};
```

Key behaviors:
- `mountedRef`, `requestIdRef`, `latestSessionRef` pattern (identical to useRoomTypes)
- On mount: call `roomService.list(session)` AND `roomTypeService.list(session)` in parallel
- `create`/`update`/`remove` throw `ServiceError` on failure (page catches and shows in dialog)
- After successful mutation → call `load()` to refresh

## Page Component Hierarchy

```
RoomsPage
  ├─ useAuthSession() → session
  ├─ useRooms(session) → state, roomTypes, create, update, remove
  ├─ FilterBar (inline)
  │    ├─ <select> status filter (optional, all/available/occupied/cleaning/maintenance/inactive)
  │    ├─ <select> room_type_id filter (optional, from roomTypes)
  │    └─ <input> search (text, debounced or immediate)
  ├─ Table
  │    ├─ Headers: Identifier, Type, Floor, State, Description, Actions
  │    └─ Rows: each room → StatusBadge for state, edit/delete buttons (role-gated)
  ├─ RoomFormModal (create/edit)
  │    ├─ react-hook-form + zodResolver(roomFormSchema)
  │    ├─ Fields: identifier (text), room_type_id (select from roomTypes), floor (text), state (select), description (text)
  │    └─ On submit → create()/update()
  └─ ConfirmDialog (delete)
       └─ On confirm → remove()
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **roomService.test.ts** | list, getById, create, update, softDelete (with reservation check) | `FakeRoomQuery` class with `.eq`/`.is`/`.neq` call tracking. Mock `from` per table (rooms vs reservations). Test 23505 handling, permission denied, reservation block |
| **useRooms.test.ts** | State machine, create/update/remove → refresh, stale-request protection, room types loaded | `vi.mock` service functions. Test loading→loaded→error transitions, session change stale protection |
| **RoomsPage.test.tsx** | Rendering states, filter behavior, modal flows, role gating, StatusBadge tones | Mock `useRooms` and `useAuthSession`. Test filter selects narrow results, StatusBadge shows correct tone per state, delete confirmation flow with reservation error |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/rooms/types.ts` | Create | Room type, RoomFormData, RoomState, RoomFilters, roomFormSchema, ROOM_STATE_TONE_MAP |
| `src/features/rooms/roomService.ts` | Create | list, getById, create, update, softDelete with reservation check |
| `src/features/rooms/useRooms.ts` | Create | Hook with list state, room types loading, create/update/remove |
| `src/features/rooms/RoomsPage.tsx` | Create | Page with filter bar, table, form modal, delete confirm |
| `src/features/rooms/index.ts` | Create | Public exports |
| `src/features/rooms/__tests__/roomService.test.ts` | Create | Service tests with FakeRoomQuery |
| `src/features/rooms/__tests__/useRooms.test.ts` | Create | Hook tests with mocked services |
| `src/features/rooms/__tests__/RoomsPage.test.tsx` | Create | Page tests with mocked hook and auth |
| `src/shared/i18n/resources/en.ts` | Modify | Add `rooms` i18n keys |
| `src/shared/i18n/resources/es.ts` | Modify | Add `rooms` i18n keys (Spanish) |

## Implementation Order

1. `types.ts` + schema (foundation, no dependencies)
2. `roomService.ts` (depends on types + shared services)
3. `roomService.test.ts` (validate service in isolation)
4. `useRooms.ts` (depends on service + roomTypeService)
5. `useRooms.test.ts` (validate hook state machine)
6. `RoomsPage.tsx` (depends on hook + shared UI)
7. `RoomsPage.test.tsx` (validate UI rendering and interactions)
8. `index.ts` (wire up exports)
9. i18n keys in `en.ts` and `es.ts`

## Migration / Rollout

No migration required. The `rooms` table, `room_state` enum, and partial unique index already exist in the database.

## Open Questions

None — all decisions are resolved by the existing room-types pattern and the spec.
