# Tasks: Soft Delete Lifecycle

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~340 (all additions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Medium (accepted — single PR)

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB Migration (002_add_soft_delete) | PR 1 | Pure SQL, independent, runs on main |
| 2 | Room types lifecycle (code) | PR 2 | TDD: types → service → hook → UI. Depends on migration |

## Phase 1: Database Migration

- [x] 1.1 Create `database/migrations/002_add_soft_delete.sql` — ALTER TABLE 13 tables ADD COLUMN `deleted_at timestamptz`
- [x] 1.2 Drop 3 UNIQUE constraints, recreate as partial unique indexes `WHERE deleted_at IS NULL`
- [x] 1.3 Add `(property_id, deleted_at)` performance indexes for 5 tables
- [x] 1.4 Create `database/migrations/002_add_soft_delete.down.sql` — reverse with duplicate-warning header

## Phase 2: Types + Test Infrastructure

- [x] 2.1 Add `deleted_at: string | null` to `RoomType` in `src/features/room-types/types.ts`
- [x] 2.2 Extend `FakeRoomTypeQuery` with `.is(column, value)` in `roomTypeService.test.ts`

## Phase 3: Service Layer TDD

- [x] 3.1 (RED) Write tests for `softDelete` succeeds/unauthorized/not-found in `roomTypeService.test.ts`
- [x] 3.2 (GREEN) Implement `softDelete(session, id)` in `roomTypeService.ts`
- [x] 3.3 (RED) Write tests asserting `list` calls `.is("deleted_at", null)`
- [x] 3.4 (GREEN) Append `.is("deleted_at", null)` to `list()` query
- [x] 3.5 (RED) Write tests asserting `getById` calls `.is("deleted_at", null)`
- [x] 3.6 (GREEN) Append `.is("deleted_at", null)` to `getById()` query
- [x] 3.7 (RED) Write tests asserting `update` on soft-deleted returns not-found
- [x] 3.8 (GREEN) Append `.is("deleted_at", null)` guard before `.eq("id", id)` in `update()`
- [x] 3.9 Export `softDelete` from `src/features/room-types/index.ts`

## Phase 4: Hook Layer TDD

- [x] 4.1 (RED) Write tests for `remove(id)` — success refreshes, failure throws, stale ignored — in `useRoomTypes.test.ts`
- [x] 4.2 (GREEN) Add `remove(id)` to `useRoomTypes.ts` following create/update stale-guard pattern
- [x] 4.3 Export `remove` from `UseRoomTypesResult` and `src/features/room-types/index.ts`

## Phase 5: UI Layer TDD

- [x] 5.1 (RED) Write tests for delete button visibility (shown for admin/manager, hidden for receptionist) in `RoomTypesPage.test.tsx`
- [x] 5.2 (RED) Write tests for confirmation modal (opens, confirms, cancels) in `RoomTypesPage.test.tsx`
- [x] 5.3 (GREEN) Add `deleteConfirm` modal state, delete button per row (gated by `canAccess("manager")`), and confirmation dialog in `RoomTypesPage.tsx`
- [x] 5.4 Wire `remove` hook call to confirm action
- [x] 5.5 `npm run build` + `npm run test:run` pass
