# Design: feat(room-types): manage room types

## Technical Approach

Follow the established `properties/` CRUD pattern: types → service → hook → page. Keep it feature-specific (no generic extraction). List renders in a table with create/edit via **Modal** (existing shared component). Actions gated by role at render level using `canAccess()`.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Reusability | A: feature-specific, B: generic `useCrudList<T>` hook, C: service factory | B/C add indirection before we have 3+ list features. Room-types is the first list CRUD. | **A** — stay feature-specific. Extract after 3+ features prove the pattern. |
| Create/edit UX | Modal vs inline form | Modal preserves list context; inline form works for single-entity but pushes list content down. Modal component already exists. | **Modal** (`src/shared/components/organisms/Modal.tsx`) |
| UNIQUE violation | Inspect raw error before `executeServiceQuery` vs custom error code mapping | Inspecting before gives control to return `validation-error` with friendly message. `executeServiceQuery` only returns `backend-error`. | **Inspect raw error** in service for `code: "23505"` (PG unique violation), return `validation-error`. Fallback to `backend-error`. |
| Role gating | Route-level vs render-level | Route already gates at `receptionist` (60). Action buttons need finer gate at `administrator` (100) / `manager` (80). | **Render-level** using `canAccess('administrator', userRole) || canAccess('manager', userRole)` |

## Data Flow

```
RoomTypesPage
  │
  ├─ useRoomTypes(session) ──→ roomTypeService.list(session)
  │                                │
  │                                ├─ withServiceContext(session)
  │                                ├─ scopeOperationalQuery(from("room_types").select("*"))
  │                                └─ executeServiceQuery → list of RoomType[]
  │
  └─ onCreate/onEdit ──→ roomTypeService.create/update(session, data)
                              │
                              ├─ assignPropertyOwnership(payload, scope)
                              ├─ from("room_types").insert/update(data)
                              └─ inspect error for "23505" → "name already exists"

Routes (routes.tsx)
  protectedRoutes.map(...) → route.id === "roomTypes"
    ? <RoomTypesPage />
    : <ModulePlaceholderPage />
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/room-types/types.ts` | Create | `RoomType`, `RoomTypeFormData`, `roomTypeFormSchema` (Zod) |
| `src/features/room-types/roomTypeService.ts` | Create | `list`, `getById`, `create`, `update` with InsForge DI |
| `src/features/room-types/useRoomTypes.ts` | Create | Hook: `loading → loaded | error`, stale-request protection, `create()`, `update()` |
| `src/features/room-types/RoomTypesPage.tsx` | Create | List table + Modal create/edit + role-gated buttons |
| `src/features/room-types/index.ts` | Create | Re-exports |
| `src/features/room-types/__tests__/roomTypeService.test.ts` | Create | Service unit tests with fake query builder |
| `src/features/room-types/__tests__/useRoomTypes.test.ts` | Create | Hook tests with mocked service |
| `src/features/room-types/__tests__/RoomTypesPage.test.tsx` | Create | Page integration tests |
| `src/app/routes/routes.tsx` | Modify | Swap `ModulePlaceholderPage` → `RoomTypesPage` for `roomTypes` route |

## Interfaces / Contracts

```typescript
// types.ts
export type RoomType = {
  readonly id: string;
  readonly property_id: string;
  readonly name: string;
  readonly description: string | null;
  readonly capacity: number;
  readonly base_price: number;
  readonly created_at: string;
  readonly updated_at: string;
};

export const roomTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  capacity: z.coerce.number().int().positive("Capacity must be > 0"),
  base_price: z.coerce.number().min(0, "Base price must be ≥ 0"),
});
export type RoomTypeFormData = z.infer<typeof roomTypeFormSchema>;

// roomTypeService.ts — follows propertyService pattern
// deps: RoomTypeServiceDeps { from(table) → { select, insert, update, eq, then } }
// list(session)          → ServiceResult<RoomType[]>
// getById(session, id)   → ServiceResult<RoomType>
// create(session, data)  → ServiceResult<RoomType>
// update(session, data)  → ServiceResult<RoomType>

// useRoomTypes.ts — follows useCurrentProperty pattern
// UseRoomTypesResult:
//   state: { status: "loading" }
//        | { status: "loaded"; roomTypes: RoomType[] }
//        | { status: "error"; error: ServiceError }
//   create(data: RoomTypeFormData) → Promise<void>  (throws on error)
//   update(id: string, data: RoomTypeFormData) → Promise<void>  (throws on error)
//   refresh() → Promise<void>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `roomTypeService` — property scope, list, create, update, duplicate name, not-found | Fake query (same pattern as `FakePropertyQuery` in propertyService.test.ts) |
| Integration | `useRoomTypes` — loading→loaded, loading→error, create/update calls service then refreshes, stale request protection | Mock service with `vi.mock`, renderHook |
| Integration | `RoomTypesPage` — list renders, empty state, error state, create button hidden for receptionist, modal opens/closes, form validation | Mock hook, Testing Library + userEvent |

## Migration / Rollout

No migration required. The `room_types` table already exists and is seeded. The route swap is purely additive on the UI side.

## Open Questions

- [ ] How does InsForge SDK surface unique constraint violations in its error shape? Confirm the error code/field to inspect before implementing service layer.
- [ ] Confirm Tailwind CSS is installed and configured (docs mention it, `config.yaml` confirms it, but verify `@tailwindcss/vite` is set up before writing TSX).
