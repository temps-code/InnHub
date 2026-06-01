# Design: feat(admin): implement recycle bin and permanent purge for room types

## Technical Approach

Extend the existing room-types feature with three new service functions (`listArchived`, `restore`, `purge`), a hook toggle (`showArchived`), and UI for viewing/restoring/permanently deleting archived room types. All operations reuse the established `withServiceContext` + `scopeOperationalQuery` + `canAccess` patterns. No DB schema changes — relies on existing `deleted_at` soft-delete column.

## Architecture Decisions

| Decision | Option A | Option B | Tradeoff | Decision |
|----------|----------|----------|----------|----------|
| **Hook structure** | Extend `useRoomTypes` with `showArchived` state | Create separate `useRoomTypesArchive` hook | Single hook keeps "one hook per page" pattern but grows ~100 lines; separate hook is cleaner but breaks convention and complicates refresh coordination | **A: extend existing** |
| **`listArchived` shape** | Separate `listArchived(session)` function | Parameterized `list(session, { archived: true })` | Separate function matches existing `list`/`getById`/`create` pattern; parameterized adds branching to existing function | **A: separate function** |
| **Duplicate name on restore** | Reject with error | Auto-rename | Reject is transparent and predictable; auto-rename is surprising | **Reject** |
| **`is()` for NOT NULL** | `.is("deleted_at", "not.eq")` | Raw filter / post-filter | InsForge SDK `.is()` supports `null` for `IS NULL`; "not null" may need `.not.is()` or `.neq()` — verify at implementation | **Verify SDK** |

## Data Flow

```
User clicks "Show Archived"
  → toggleArchived() sets showArchived = true
  → load() calls listArchived(session) instead of list(session)
  → listArchived queries: scopeOperationalQuery → .neq("deleted_at", null)
  → archived roomTypes render in table

User clicks Restore
  → ConfirmDialog opens → user confirms
  → restore(id) calls restoreService(session, id)
  → Service: load record → verify deleted_at IS NOT NULL → check no active name duplicate → UPDATE deleted_at = NULL
  → On success: load() refreshes current view (archived list)
  → On error: throw → UI shows error in dialog

User clicks Purge
  → Danger ConfirmDialog opens → user confirms
  → purge(id) calls purgeService(session, id)
  → Service: load record → verify deleted_at IS NOT NULL → check rooms FK → check reservation_items FK → physical DELETE
  → On success: load() refreshes archived list
  → On FK conflict: throw foreign-key-conflict → UI shows alert
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/services/serviceResult.ts` | Modify | Add `"foreign-key-conflict"` to `ServiceErrorCode` union + default message |
| `src/features/room-types/roomTypeService.ts` | Modify | Add `listArchived`, `restore`, `purge` functions; extend `RoomTypeServiceDepsQuery` interface for `neq`/`delete` methods |
| `src/features/room-types/useRoomTypes.ts` | Modify | Add `showArchived` state, `toggleArchived()`, `restore(id)`, `purge(id)` methods; update `load()` to branch on `showArchived` |
| `src/features/room-types/RoomTypesPage.tsx` | Modify | Add toggle button, archived table, restore/purge confirmation dialogs, error handling |
| `src/shared/i18n/resources/en.ts` | Modify | Add ~20 keys under `roomTypes.archive.*` |
| `src/shared/i18n/resources/es.ts` | Modify | Add ~20 keys under `roomTypes.archive.*` |
| `src/features/room-types/__tests__/roomTypeService.test.ts` | Modify | Tests for `listArchived`, `restore`, `purge` with FakeRoomTypeQuery |
| `src/features/room-types/__tests__/useRoomTypes.test.ts` | Modify | Tests for toggle, restore, purge hook flows |
| `src/features/room-types/__tests__/RoomTypesPage.test.tsx` | Modify | Tests for toggle visibility, restore/purge dialogs |

## Interfaces / Contracts

### New ServiceErrorCode

```typescript
export type ServiceErrorCode =
  | "configuration-error"
  | "backend-error"
  | "validation-error"
  | "property-scope-error"
  | "not-found"
  | "foreign-key-conflict"   // ← NEW
  | "unknown-error";
```

### Query Interface Extension

```typescript
// Extend RoomTypeServiceDepsQuery with:
readonly neq: (column: string, value: unknown) => this;
readonly delete: () => { data: unknown; error: unknown };
```

### Service Function Signatures

```typescript
listArchived(session: AppSession | null, deps?: RoomTypeServiceDeps): Promise<ServiceResult<RoomType[]>>
restore(session: AppSession | null, id: string, deps?: RoomTypeServiceDeps): Promise<ServiceResult<RoomType>>
purge(session: AppSession | null, id: string, deps?: RoomTypeServiceDeps): Promise<ServiceResult<RoomType>>
```

### Hook Return Type Extension

```typescript
export type UseRoomTypesResult = {
  readonly state: RoomTypesState;
  readonly showArchived: boolean;
  readonly create: (data: RoomTypeFormData) => Promise<void>;
  readonly update: (id: string, data: RoomTypeFormData) => Promise<void>;
  readonly remove: (id: string) => Promise<void>;
  readonly toggleArchived: () => void;
  readonly restore: (id: string) => Promise<void>;
  readonly purge: (id: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (service) | `listArchived` queries `neq("deleted_at", null)` | FakeRoomTypeQuery with `neqCalls` tracker |
| Unit (service) | `restore` loads soft-deleted → checks name duplicate → sets `deleted_at = null` | Fake query: track eq calls, verify update payload |
| Unit (service) | `purge` loads soft-deleted → checks rooms FK → checks reservation_items FK → physical delete | Fake query: simulate FK rows present/absent |
| Unit (service) | Purge returns `foreign-key-conflict` when FK rows exist | Fake query returning count > 0 |
| Unit (hook) | `toggleArchived` flips state and calls correct service | Mock service, verify call args |
| Unit (hook) | `restore(id)` success refreshes archived list | Mock service success → verify load called |
| Unit (hook) | `purge(id)` throws on FK conflict | Mock service returning error |
| Integration (UI) | Toggle button visible for manager, hidden for receptionist | Mock hook, test rendering by role |
| Integration (UI) | Purge shows danger confirmation dialog | Click purge → verify dialog opens |
| Integration (UI) | FK conflict error displays in purge dialog | Mock purge throwing error → verify alert |

## Migration / Rollout

No migration required. No DB schema changes. The `deleted_at` column and `ON DELETE RESTRICT` constraints already exist.

## Open Questions

- [ ] Verify InsForge SDK supports `.neq()` or equivalent for `IS NOT NULL` filtering — the exploration flagged this as a risk. If `.neq()` is unavailable, fall back to `.not.is("deleted_at", null)` or post-filter.
