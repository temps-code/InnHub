# Tasks: feat(rooms): manage rooms and physical states

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-qa |

## Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Types + service + service tests | PR 1 | Foundation: types.ts, roomService.ts, roomService.test.ts |
| 2 | Hook + hook tests | PR 2 | Depends on PR 1: useRooms.ts, useRooms.test.ts |
| 3 | Page + page tests + i18n | PR 3 | Depends on PR 2: RoomsPage.tsx, RoomsPage.test.tsx, i18n |
| 4 | Exports + route integration | PR 4 | Depends on PR 3: index.ts, routes.tsx |

## Phase 1: Types & Foundation

- [x] 1.1 Create `src/features/rooms/types.ts`
- [x] 1.2 Create `src/features/rooms/roomService.ts`
- [x] 1.3 Run `npm run build` to verify types compile

## Phase 2: Service Tests

- [x] 2.1 Create `src/features/rooms/__tests__/roomService.test.ts`
- [x] 2.2 Run `npm run test:run` to verify service tests pass

## Phase 3: Hook Implementation

- [x] 3.1 Create `src/features/rooms/useRooms.ts`
- [x] 3.2 Run `npm run build` to verify hook types

## Phase 4: Hook Tests

- [x] 4.1 Create `src/features/rooms/__tests__/useRooms.test.ts`
- [x] 4.2 Run `npm run test:run` to verify hook tests pass

## Phase 5: Page Component

- [x] 5.1 Create `src/features/rooms/RoomsPage.tsx`
- [x] 5.2 Run `npm run lint` and `npm run build` to verify page compiles

## Phase 6: Page Tests

- [x] 6.1 Create `src/features/rooms/__tests__/RoomsPage.test.tsx`
- [x] 6.2 Run `npm run test:run` to verify page tests pass

## Phase 7: Exports & i18n

- [x] 7.1 Create `src/features/rooms/index.ts`
- [x] 7.2 Add rooms i18n keys to `src/shared/i18n/resources/en.ts`
- [x] 7.3 Add rooms i18n keys to `src/shared/i18n/resources/es.ts`
- [x] 7.4 Run `npm run build` and `npm run lint` to verify full build passes

## Phase 8: Final Verification

- [x] 8.1 Run full test suite: `npm run test:run`
- [x] 8.2 Run `npm run build` to confirm production build
- [x] 8.3 Run `npm run lint` to confirm no lint errors
