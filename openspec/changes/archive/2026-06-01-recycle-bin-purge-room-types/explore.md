# Exploration: Recycle Bin & Purge for Room Types (Issue #84)

## Current State

Room types use soft-delete (`deleted_at` column). The `list` service excludes soft-deleted records via `.is("deleted_at", null)`. The `softDelete` service sets `deleted_at` to the current timestamp. There is no UI or service to view, restore, or permanently delete archived records.

**Key existing patterns:**
- Service functions follow `withServiceContext(session, async (ctx) => {...})` with `scopeOperationalQuery` for property scoping
- Permission checks use `canAccess("manager", profile.role)`
- The hook (`useRoomTypes`) exposes `{ state, create, update, remove, refresh }` with stale-request protection
- The UI uses `ModalMode` state for create/edit, `ConfirmDialog` for delete confirmation
- Tests use `FakeRoomTypeQuery` with `eqCalls`/`isCalls` tracking at service level, mock service at hook level, mock hook at UI level

## Affected Areas

- `src/shared/services/serviceResult.ts` — Add `"foreign-key-conflict"` to `ServiceErrorCode` union
- `src/features/room-types/roomTypeService.ts` — Add `listArchived`, `restore`, `purge` functions; add FK check helper for `rooms` + `reservation_items`
- `src/features/room-types/useRoomTypes.ts` — Add `showArchived` state, `restore`, `purge` methods; optionally split into `useRoomTypesArchive` or extend existing
- `src/features/room-types/RoomTypesPage.tsx` — Add toggle, restore/purge buttons, restore-confirmation dialog, purge-confirmation dialog, duplicate-name-on-restore error handling
- `src/features/room-types/types.ts` — No changes needed (RoomType already has `deleted_at`)
- `src/shared/i18n/resources/en.ts` — ~20 new keys under `roomTypes.archive.*`
- `src/shared/i18n/resources/es.ts` — ~20 new keys under `roomTypes.archive.*`
- `src/features/room-types/__tests__/roomTypeService.test.ts` — Tests for `listArchived`, `restore`, `purge`
- `src/features/room-types/__tests__/useRoomTypes.test.ts` — Tests for new hook methods
- `src/features/room-types/__tests__/RoomTypesPage.test.tsx` — Tests for toggle, restore, purge UI flows

## Approaches

### 1. Extend existing hook with `showArchived` toggle

Add `showArchived: boolean` to the hook state. When `true`, call `listArchived` instead of `list`. Add `restore(id)` and `purge(id)` methods. The page manages `showArchived` via a toggle button.

**Pros:**
- Single hook for all room type data — simpler wiring
- `refresh()` works for both modes
- Consistent with existing pattern (one hook per feature page)
- State machine stays clean: `loading → loaded (with roomTypes array) → error`

**Cons:**
- Hook grows from ~144 to ~250 lines
- `roomTypes` array semantics change based on `showArchived` (hidden complexity)
- Need to track which mode we're in to know if restore/purge succeeded correctly

**Effort:** Low

### 2. Separate `useRoomTypesArchive` hook

Create a second hook that manages archived room types independently. The page calls both hooks and toggles visibility.

**Pros:**
- Separation of concerns — each hook is small and focused
- Independent loading/error states
- Archive operations don't pollute the main hook

**Cons:**
- Two hooks to wire up, two states to manage
- Page component becomes more complex (two hooks × two states)
- Refresh coordination between hooks is fragile
- Breaks the "one hook per page" pattern established in this codebase

**Effort:** Medium

### 3. Service function approach: Use separate `listArchived` vs parameterized `list`

Option A: `listArchived(session)` — separate function
Option B: `list(session, { includeArchived: true })` — parameterized

**Pros of separate function (A):**
- Follows existing pattern exactly (`list`, `getById`, `create`, etc.)
- Each function has a single responsibility
- Test isolation is clean

**Pros of parameterized (B):**
- Fewer exported functions
- Single entry point for "get room types"

**Cons of parameterized (B):**
- Breaks the existing pattern where each query shape is a separate function
- The `is("deleted_at", null)` filter is baked into `list` already — parameterizing adds branching

**Recommendation:** Use separate `listArchived(session)` — matches existing patterns exactly.

## Edge Cases

### Duplicate Name on Restore

The partial unique index `room_types_property_name_active_idx` (WHERE deleted_at IS NULL) means:
1. Soft-delete "Standard Queen" (id: rt-1)
2. Create new "Standard Queen" (id: rt-2, active)
3. Try to restore rt-1 → PostgreSQL UNIQUE violation (code 23505)

**Options:**
- **Reject with user-friendly error**: "Cannot restore: a room type with this name already exists. Rename the active one or delete it first." — Safest, most transparent.
- **Auto-rename**: Append "(restored)" to the name — Surprising, may not be what user wants.
- **Prompt for rename**: Show a form to rename before restore — Over-engineered for MVP.

**Recommendation:** Reject with clear error message. The user can rename the conflicting active type, then restore.

### FK Check on Purge

Two tables reference `room_types`:
1. `rooms.room_type_id` → ON DELETE RESTRICT
2. `reservation_items.room_type_id` → ON DELETE RESTRICT

The issue mentions only `rooms`, but `reservation_items` also blocks purge. Service must check BOTH.

**Approach:** Query both `rooms` and `reservation_items` for the given `room_type_id`. If either has rows, return `"foreign-key-conflict"` with a message listing what blocks the purge.

## Service Layer Design

```typescript
// New error code
type ServiceErrorCode = ... | "foreign-key-conflict";

// listArchived: query with deleted_at IS NOT NULL
export async function listArchived(session, deps?): Promise<ServiceResult<RoomType[]>> {
  // Same pattern as list(), but .is("deleted_at", "not.eq") or equivalent
}

// restore: SET deleted_at = NULL, guard against duplicate name
export async function restore(session, id, deps?): Promise<ServiceResult<RoomType>> {
  // 1. Load the soft-deleted record (query with deleted_at IS NOT NULL)
  // 2. Check if active record with same name exists → conflict
  // 3. Update deleted_at = NULL
}

// purge: physical DELETE, check FK first
export async function purge(session, id, deps?): Promise<ServiceResult<RoomType>> {
  // 1. Load the soft-deleted record
  // 2. Check rooms WHERE room_type_id = id → if any, foreign-key-conflict
  // 3. Check reservation_items WHERE room_type_id = id → if any, foreign-key-conflict
  // 4. Physical DELETE
}
```

## Hook Layer Design

Extend `useRoomTypes` with:
- `showArchived: boolean` (local state, not in `RoomTypesState`)
- `toggleArchived(): void`
- `restore(id: string): Promise<void>`
- `purge(id: string): Promise<void>`

When `showArchived` changes, `load()` is re-triggered calling `listArchived` instead of `list`.

## UI Layer Design

1. **Toggle button** next to "Create Room Type" — "Show Archived" / "Show Active" (admin/manager only)
2. **Archived view**: Table shows `name`, `capacity`, `base_price`, `description`, `deleted_at`, with Restore and Purge buttons per row
3. **Restore confirmation dialog**: "Restore this room type? It will reappear in the active list."
4. **Purge confirmation dialog** (danger variant): "Permanently delete this room type? This cannot be undone." + FK conflict error handling
5. **Duplicate name error on restore**: Displayed in the restore confirmation dialog's error slot

## i18n Keys (~20)

```typescript
roomTypes: {
  archive: {
    showArchived: "Show Archived",
    showActive: "Show Active",
    emptyTitle: "No archived room types",
    emptyMessage: "Deleted room types will appear here.",
    deletedAt: "Deleted",
    restore: "Restore",
    purge: "Permanently Delete",
    restoreConfirmTitle: "Restore Room Type",
    restoreConfirmMessage: "This will restore the room type to the active list.",
    restoreConfirmAccept: "Restore",
    restoreConfirmCancel: "Cancel",
    restoreDuplicateError: "Cannot restore: a room type with this name already exists. Rename or delete the active one first.",
    restorePermissionError: "You don't have permission to restore room types.",
    restoreGenericError: "Could not restore the room type. Try again.",
    purgeConfirmTitle: "Permanently Delete Room Type",
    purgeConfirmMessage: "This will permanently remove the room type. This action cannot be undone.",
    purgeConfirmAccept: "Delete Permanently",
    purgeConfirmCancel: "Cancel",
    purgePermissionError: "You don't have permission to permanently delete room types.",
    purgeGenericError: "Could not permanently delete the room type. Try again.",
    purgeForeignKeyError: "Cannot delete: this room type is still referenced by rooms or reservation items.",
  }
}
```

## Recommendation

**Approach 1 (extend existing hook)** + **separate `listArchived` service function**.

Rationale:
- The codebase establishes "one hook per page" — breaking that creates inconsistency
- `showArchived` is a view toggle, not a new feature with its own data lifecycle
- The service layer stays clean with separate functions
- The hook grows modestly (~100 lines) and stays readable
- Test patterns are well-established and straightforward to extend

## Risks

1. **`listArchived` must also scope by property** — easy to forget `.eq("property_id", ...)` when the mental model is "archived = deleted"
2. **Restore race condition** — two admins could try to restore simultaneously; the unique index catches this, but the UX must handle it gracefully
3. **FK check must query both `rooms` AND `reservation_items`** — the issue only mentions `rooms`, but the database has both FKs
4. **The `is()` method on the query builder may not support `not eq` directly** — need to verify InsForge SDK supports filtering for `deleted_at IS NOT NULL` (the existing `is("deleted_at", null)` works for NULL checks)
5. **Hook state refresh after restore/purge** — if `showArchived=true` and we purge, the record disappears; if `showArchived=false` and we restore, the record appears; both need correct `load()` calls

## Ready for Proposal

**Yes.** The analysis is complete with clear service/hook/UI patterns, edge cases documented, and a recommended approach. The orchestrator can proceed to proposal with confidence.

**Key decision for user:** On restore duplicate-name conflict — reject with error (recommended) vs auto-rename vs prompt for rename. The recommendation is to reject.
