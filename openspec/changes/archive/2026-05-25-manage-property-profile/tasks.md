# Tasks: Manage Property Profile

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (foundation+core+tests) → PR 2 (page+route+i18n+tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Types, service, hook + tests | PR 1 | Base: `features` branch; standalone testable |
| 2 | Page, route swap, i18n + tests | PR 2 | Base: PR 1 branch; depends on PR 1 |

## Phase 1: Foundation

- [x] 1.1 Create `src/features/properties/types.ts` — `Property`, `PropertyFormData` interfaces, `propertyFormSchema`
- [x] 1.2 Create `src/features/properties/index.ts` — barrel re-exports

## Phase 2: Core (TDD — RED → GREEN)

- [x] 2.1 RED: Write `__tests__/propertyService.test.ts` — scope enforcement, not-found, error sanitization
- [x] 2.2 GREEN: Create `propertyService.ts` — `getCurrentProperty`, `updateCurrentProperty`
- [x] 2.3 RED: Write `__tests__/useCurrentProperty.test.ts` — loading, data, error, update, refresh
- [x] 2.4 GREEN: Create `useCurrentProperty.ts` — hook with states + `update()`/`refresh()`

## Phase 3: Page & Integration (TDD — RED → GREEN)

- [x] 3.1 RED: Write `__tests__/PropertyProfilePage.test.tsx` — render, toggle, validation, submit, errors
- [x] 3.2 GREEN: Create `PropertyProfilePage.tsx` — read view + RHF/Zod edit form
- [x] 3.3 Modify `routes.tsx` — conditional renders PropertyProfilePage for `route.id === "properties"`
- [x] 3.4 Add `properties.*` i18n keys to `en.ts` and `es.ts`

## Phase 4: Verification

- [x] 4.1 Run `npm run lint && npm run build && npm run test:run`
