# Tasks: feat(rooms): manage rooms and physical states

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Types + service + service tests | PR 1 | Foundation: types.ts, roomService.ts, roomService.test.ts (~350 lines) |
| 2 | Hook + hook tests | PR 2 | Depends on PR 1: useRooms.ts, useRooms.test.ts (~220 lines) |
| 3 | Page + page tests + i18n + exports | PR 3 | Depends on PR 2: RoomsPage.tsx, RoomsPage.test.tsx, index.ts, i18n (~530 lines) |

## Phase 1: Types & Foundation

- [x] 1.1 Create `src/features/rooms/types.ts` — Room type, RoomState union, RoomFormData, RoomFilters, roomFormSchema (zod), ROOM_STATE_TONE_MAP (~50 lines)
- [x] 1.2 Create `src/features/rooms/roomService.ts` — list (with client-side filters), getById, create, update, softDelete with reservation check. Follow roomTypeService deps pattern: RoomServiceDeps, scopeOperationalQuery, canAccess, handleDatabaseError for 23505 (~180 lines)
- [x] 1.3 Run `npm run build` to verify types compile

## Phase 2: Service Tests

- [x] 2.1 Create `src/features/rooms/__tests__/roomService.test.ts` — FakeRoomQuery with .eq/.is/.select call tracking, mock `from` per table. Test: list returns filtered rooms, getById returns single room, create inserts and returns, update modifies fields, softDelete checks reservations then sets deleted_at, softDelete blocked by active reservation, duplicate identifier returns validation error, unauthorized user rejected (~200 lines)
- [x] 2.2 Run `npm run test:run` to verify service tests pass

## Phase 3: Hook Implementation

- [ ] 3.1 Create `src/features/rooms/useRooms.ts` — useState + useRef + useCallback + useEffect with mountedRef/requestIdRef/latestSessionRef stale closure protection. On mount: parallel load roomService.list + roomTypeService.list. Expose create/update/remove/refresh. After mutation → call load() (~100 lines)
- [ ] 3.2 Run `npm run build` to verify hook types

## Phase 4: Hook Tests

- [ ] 4.1 Create `src/features/rooms/__tests__/useRooms.test.ts` — vi.mock service functions. Test: loading→loaded→error transitions, create calls refresh, update calls refresh, remove calls refresh, stale request after session change does not overwrite, room types loaded on mount (~120 lines)
- [ ] 4.2 Run `npm run test:run` to verify hook tests pass

## Phase 5: Page Component

- [ ] 5.1 Create `src/features/rooms/RoomsPage.tsx` — useAuthSession + useRooms. FilterBar: status select, room_type select, text input. Table: identifier, type name, floor, StatusBadge (tone map), description, actions (edit/delete role-gated). RoomFormModal: react-hook-form + zodResolver(roomFormSchema), fields (identifier, room_type_id select from roomTypes, floor, state select, description). ConfirmDialog for delete. Handle service errors in dialog (~250 lines)
- [ ] 5.2 Run `npm run lint` and `npm run build` to verify page compiles

## Phase 6: Page Tests

- [ ] 6.1 Create `src/features/rooms/__tests__/RoomsPage.test.tsx` — Mock useRooms and useAuthSession. Test: renders loading state, renders empty state, renders room list with StatusBadge tones, status filter narrows results, room type filter narrows results, text search matches identifier and description, create modal opens and submits, edit modal opens pre-filled, delete confirmation shows and confirms, delete hidden for receptionist, reservation error shown on soft delete block (~180 lines)
- [ ] 6.2 Run `npm run test:run` to verify page tests pass

## Phase 7: Exports & i18n

- [ ] 7.1 Create `src/features/rooms/index.ts` — barrel exports for Room, RoomFormData, RoomState, RoomFilters, roomFormSchema, roomService, useRooms, RoomsPage (~10 lines)
- [ ] 7.2 Add rooms i18n keys to `src/shared/i18n/resources/en.ts` — all keys under "rooms." namespace per spec (~80 lines)
- [ ] 7.3 Add rooms i18n keys to `src/shared/i18n/resources/es.ts` — Spanish translations (~80 lines)
- [ ] 7.4 Run `npm run build` and `npm run lint` to verify full build passes

## Phase 8: Final Verification

- [ ] 8.1 Run full test suite: `npm run test:run`
- [ ] 8.2 Run `npm run build` to confirm production build
- [ ] 8.3 Run `npm run lint` to confirm no lint errors
