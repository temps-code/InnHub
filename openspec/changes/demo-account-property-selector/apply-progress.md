# Apply Progress: demo-account-property-selector

## Status

Implemented in strict TDD mode. Feature implementation stays within the selected single-PR review budget: `src/features/auth` + `src/shared/i18n` diff is 399 changed lines (`262 insertions`, `137 deletions`). Existing uncommitted RLS migration/docs work was preserved and not modified for this UI feature.

## Completed Tasks

- [x] Added RED credential catalog tests for two demo properties, 10 accounts, five roles per property, Hostal Manager lookup, and Hotel Tarija default compatibility.
- [x] Implemented property-aware demo credential catalog and helpers.
- [x] Added RED selector tests for property controls, default Hotel Tarija state, Hostal Los Chapacos Manager selection, `aria-pressed`, and credentials-only payload.
- [x] Implemented property-aware selector UI with local selected-property state.
- [x] Added/updated login integration tests for property-aware modal guidance and Hostal Manager auth flow.
- [x] Added EN/ES i18n copy for property-aware selector guidance, labels, and property names.
- [x] Ran focused and full validation commands.

## Remaining Tasks

- [ ] Manual smoke test in local/deployed app: use Hotel Tarija + Manager and Hostal Los Chapacos + Manager from the modal and confirm property-scoped data after login.

## Files Changed For This Feature

- `src/features/auth/services/demoCredentials.ts`
- `src/features/auth/__tests__/demoCredentials.test.ts`
- `src/features/auth/components/DemoAccountSelector.tsx`
- `src/features/auth/components/__tests__/DemoAccountSelector.test.tsx`
- `src/features/auth/__tests__/LoginForm.test.tsx`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `openspec/changes/demo-account-property-selector/tasks.md`
- `openspec/changes/demo-account-property-selector/apply-progress.md`

## Preserved Existing Work

The worktree also contains pre-existing RLS migration/docs changes from the parent session. This apply did not edit RLS migrations, `AuthSessionProvider`, `authSessionService`, `insforgeAuthSessionGateway`, or database seed SQL for this UI feature.

## TDD Cycle Evidence

| Cycle | RED evidence | GREEN evidence | TRIANGULATE / REFACTOR evidence |
| --- | --- | --- | --- |
| Credential catalog | `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` failed: missing `getAllDemoProperties`, `getDemoAccountsForProperty`, `getDemoAccountForProperty`; old catalog returned 5 accounts. | Same command passed: 17 tests. | Added explicit Hostal Manager lookup and Hotel/Hostal five-role assertions. |
| Selector UI | `npm run test:run -- src/features/auth/components/__tests__/DemoAccountSelector.test.tsx` failed: no property controls/`aria-pressed`, duplicate role-only list. | Same command passed: 5 tests initially, then 2 compacted tests after refactor. | Added Hostal Manager non-default assertion and `propertyId` absence in `onSelect` payload. Refactored tests to stay under review budget. |
| Login/i18n | Added LoginForm integration coverage for property-aware guidance and Hostal Manager credential flow. Focused command passed after selector/i18n implementation was already required for selector GREEN. | `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/shared/i18n/__tests__/locales.test.ts` passed: 13 tests. | Copy explicitly says profile determines actual property scope; LoginForm still submits through existing auth boundary. |

## Test Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` | Failed, then passed | RED/GREEN credential cycle. |
| `npm run test:run -- src/features/auth/components/__tests__/DemoAccountSelector.test.tsx` | Failed, then passed | RED/GREEN selector cycle. |
| `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/shared/i18n/__tests__/locales.test.ts` | Passed | Login/i18n focused validation. |
| `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts src/features/auth/components/__tests__/DemoAccountSelector.test.tsx src/features/auth/__tests__/LoginForm.test.tsx src/shared/i18n/__tests__/locales.test.ts` | Passed | 4 files / 32 tests. |
| `npm run test:run` | Passed | 41 files / 509 tests. Warning: Node `module.register()` deprecation; jsdom localStorage experimental warning. |
| `npm run lint` | Passed with warning | Existing Fast Refresh warning in `src/shared/components/molecules/FormField.tsx:37:14`. |
| `npm run build` | Passed with warnings | Node `module.register()` deprecation; Vite chunk-size warning (`713.65 kB`). |

## Deviations From Design

- Kept `getDemoAccount(role)` as a compatibility helper that defaults to Hotel Tarija.
- Did not change `LoginForm.tsx`; existing modal/open/submit integration already consumed updated selector and i18n copy.
- Did not add resource-key coverage in `locales.test.ts` because that test currently verifies locale policy only, not translation shape.

## Workload / PR Boundary

- Delivery path: single PR default.
- Implementation-only diff: 399 changed lines, under the 400-line review budget.
- Keep separate from the earlier RLS migration/docs work when committing later.
