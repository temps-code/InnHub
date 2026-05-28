# Design: Soft Delete Lifecycle

## Technical Approach

Two independent work units running in parallel — (1) database migration adds `deleted_at` across 13 tables with partial unique indexes, (2) room types lifecycle implements soft-delete in the service/hook/UI layer. Unit 1 is pure SQL; unit 2 is TDD feature work using the `FakeRoomTypeQuery` pattern.

## Architecture Decisions

| Decision | Options | Tradeoffs | Chosen |
|----------|---------|-----------|--------|
| UNIQUE enforcement | Composite UNIQUE(col1, col2, deleted_at) | Allows exactly one NULL per constraint — PG `UNIQUE` treats NULLs as distinct, but composite with a nullable column effectively permits duplicates | Partial unique index `WHERE deleted_at IS NULL` — explicit intent, standard PG practice |
| `FakeRoomTypeQuery` `.is()` | Add `is` method alongside `eq` | Minimal change; the fake must mirror the real query builder API | Add `.is(column, value)` returning `this` — same contract as `eq` |
| Delete confirmation UI | Alert dialog inline vs. reusable modal | Inline state simpler; reusable `Modal` already exists and has overlay pattern | Use existing `Modal` component with `deleteConfirm` state — consistent with create/edit pattern |
| `remove()` stale guard | Uses `requestSession !== latestSessionRef` | Same guard as create/update; session could theoretically change while modal is open | Follow exact create/update pattern — guards against session change mid-request |

## Data Flow

```
User clicks Delete → modal opens → confirm →
  remove(id) → useRoomTypes.remove(id) →
    roomTypeService.softDelete(session, id) →
      .eq("id", id).is("deleted_at", null).update({ deleted_at: "NOW()" })
    ← success → load() refreshes list ← list now filters .is("deleted_at", null)
    ← error → thrown to UI → modal stays open, error shown
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database/migrations/002_add_soft_delete.sql` | Create | ALTER TABLE 13 tables ADD COLUMN `deleted_at timestamptz`; drop+recreate 3 UNIQUE as partial indexes; add 5 `(property_id, deleted_at)` indexes |
| `database/migrations/002_add_soft_delete.down.sql` | Create | DROP partial indexes, restore UNIQUE, DROP COLUMN `deleted_at`. Header warns recreated UNIQUE may fail if duplicates exist |
| `src/features/room-types/types.ts` | Modify | Add `deleted_at: string \| null` to `RoomType` type |
| `src/features/room-types/roomTypeService.ts` | Modify | Add `softDelete()`; append `.is("deleted_at", null)` to `list`, `getById`, `update`; export `softDelete` |
| `src/features/room-types/useRoomTypes.ts` | Modify | Add `remove(id)` following create/update stale-guard pattern; refresh on success, throw on error |
| `src/features/room-types/RoomTypesPage.tsx` | Modify | Add `deleteConfirm` state + confirmation modal; delete button per row gated by `canAccess("manager")` |
| `src/features/room-types/index.ts` | Modify | Export `softDelete` |
| `src/features/room-types/__tests__/roomTypeService.test.ts` | Modify | Extend `FakeRoomTypeQuery` with `.is()`; add softDelete test block; update list/getById tests to assert `.is()` called |
| `src/features/room-types/__tests__/useRoomTypes.test.ts` | Modify | Add `mockRemove`, add remove() test block |
| `src/features/room-types/__tests__/RoomTypesPage.test.tsx` | Modify | Add delete button visibility tests + delete flow tests |

## Interfaces / Contracts

```typescript
// New service function signature
export async function softDelete(
  session: AppSession | null,
  id: string,
  deps?: RoomTypeServiceDeps,
): Promise<ServiceResult<RoomType>>;

// Extended query interface
export interface RoomTypeServiceDepsQuery {
  readonly eq: (column: string, value: string) => this;
  readonly is: (column: string, value: string | null) => this;  // NEW
  readonly select: () => this;
  readonly then: <TResult>(...) => Promise<TResult>;
}

// Extended hook result
export type UseRoomTypesResult = {
  readonly state: RoomTypesState;
  readonly create: (data: RoomTypeFormData) => Promise<void>;
  readonly update: (id: string, data: RoomTypeFormData) => Promise<void>;
  readonly remove: (id: string) => Promise<void>;                // NEW
  readonly refresh: () => Promise<void>;
};

// Updated RoomType
export type RoomType = {
  // ... existing fields
  readonly deleted_at: string | null;  // NEW
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Service | `softDelete` succeeds, rejects unauthorized, sets `deleted_at` | `FakeRoomTypeQuery` with `.is()` support; assert `.is("deleted_at", null)` called on list/getById/update |
| Service | `update` on soft-deleted returns not-found | Fake returns empty data after `.is("deleted_at", null)` filter |
| Service | `list` excludes soft-deleted | Fake stores call chain, test asserts `.is("deleted_at", null)` appended |
| Hook | `remove(id)` calls softDelete, refreshes on success | Mock `softDelete` in service layer; follow create/update test patterns |
| Hook | `remove(id)` throws on failure, no refresh | Mock returns error; assert state unchanged |
| Hook | Stale remove ignored after session change | Deferred mock + rerender pattern |
| UI | Delete button visible for admin/manager, hidden for receptionist | Mock `useRoomTypes` with `remove`; role-gate assertions |
| UI | Confirmation modal opens/closes/confirms | Click delete → expect dialog; confirm → `remove` called; cancel → dismissed |

## Migration / Rollout

Migration `002_add_soft_delete.sql` is additive-only (adds columns, recreates constraints as partial indexes). Run first, then deploy app. Safe to roll forward only — the down migration requires manual conflict resolution if duplicates exist post-migration.

No migration required for room types lifecycle — it is purely service/hook/UI code that reads/writes the new column.

## Open Questions

None. The proposal and specs fully resolve the design scope.
