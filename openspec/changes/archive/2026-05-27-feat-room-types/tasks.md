# Tasks: feat(room-types): manage room types

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Total estimated changed lines | ~650-730 |
| 400-line budget risk | High (total) |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main (all PRs → qa) |

Decision needed before apply: Yes (resolved — chained into 2 PRs)
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low (per PR)

### Work Units

| PR | Content | Est. lines | Tests included | Depends on |
|----|---------|------------|----------------|------------|
| **PR 1** | types, i18n, service layer + service tests | ~235 | ✅ Yes | — |
| **PR 2** | hook + hook tests | ~180 | ✅ Yes | PR 1 |
| **PR 3** | page + page tests + route swap | ~370 | ✅ Yes | PR 1, PR 2 |

## PR 1 — Foundation

- [x] 1.1 Create `src/features/room-types/types.ts` — `RoomType`, `RoomTypeFormData`, `roomTypeFormSchema`
- [x] 1.2 Add i18n keys to `src/shared/i18n/resources/en.ts` and `es.ts`
- [x] 1.3 Create `src/features/room-types/roomTypeService.ts` — `list`, `getById`, `create`, `update` with UNIQUE violation handling
- [x] 1.4 Create `src/features/room-types/index.ts` — re-exports
- [x] 1.5 Create `src/features/room-types/__tests__/roomTypeService.test.ts` — property scope, list, create, duplicate name, not-found
- [x] 1.6 Verify `npm run build` + `npm run test:run` pass

## PR 2 — Hook

- [x] 2.1 Create `src/features/room-types/useRoomTypes.ts` — loading/loaded/error state machine, stale protection, create/update/refresh
- [x] 2.2 Create `src/features/room-types/__tests__/useRoomTypes.test.ts` — states, create/update calls service, stale protection
- [x] 2.3 Verify `npm run build` + `npm run test:run` pass

## PR 3 — Page + Routes

- [x] 3.1 Create `src/features/room-types/RoomTypesPage.tsx` — table + Modal form + role-gated create/edit buttons
- [x] 3.2 Create `src/features/room-types/__tests__/RoomTypesPage.test.tsx` — list renders, empty/error states, role gating, modal flow
- [x] 3.3 Modify `src/app/routes/routes.tsx` — swap `ModulePlaceholderPage` → `RoomTypesPage` for `roomTypes` route
- [x] 3.4 Verify `npm run build` + `npm run test:run` + `npm run lint` pass
