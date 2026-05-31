# Tasks: Demo Account Property Selector

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 260-390 implementation lines; ~80-130 additional OpenSpec lines |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR: credential catalog + selector UI + i18n + tests |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Preconditions

- Work on branch `features`.
- Preserve existing uncommitted RLS migration/docs work; do not edit RLS/database files for this feature.
- Follow strict TDD from `openspec/config.yaml`: RED → GREEN → TRIANGULATE → REFACTOR.
- Do not trust UI-selected property as session scope; it only chooses demo credentials.

## Implementation Tasks

### 1. RED — credential catalog tests

- [x] 1.1 Update `src/features/auth/__tests__/demoCredentials.test.ts` to expect `getAllDemoProperties()` with exactly `hotel-tarija` and `hostal-los-chapacos`.
- [x] 1.2 Update the same test file to expect `getAllDemoAccounts()` returns exactly 10 accounts: 2 properties × 5 roles.
- [x] 1.3 Add assertions that `getDemoAccountsForProperty("hotel-tarija")` and `getDemoAccountsForProperty("hostal-los-chapacos")` each return administrator, manager, receptionist, housekeeping, and maintenance.
- [x] 1.4 Add assertion that `getDemoAccountForProperty("hostal-los-chapacos", "manager")` returns `admin+loschapacos-manager@innhub.dev` with the demo password.
- [x] 1.5 Keep/adjust compatibility coverage for `getDemoAccount(role)` to default to Hotel Tarija or explicitly remove only if no callers remain.
- [x] 1.6 Run focused tests and confirm failure for missing helpers/data: `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts`.

### 2. GREEN — credential catalog implementation

- [x] 2.1 Update `src/features/auth/services/demoCredentials.ts` with `DemoPropertyId`, `DemoProperty`, `DEFAULT_DEMO_PROPERTY_ID`, and 2-property demo catalog.
- [x] 2.2 Expand `DEMO_ACCOUNTS` in `src/features/auth/services/demoCredentials.ts` to include the five Hostal Los Chapacos accounts documented in `docs/seed-data.md`.
- [x] 2.3 Add helpers in `src/features/auth/services/demoCredentials.ts`: `getAllDemoProperties()`, `getDemoAccountsForProperty(propertyId)`, and `getDemoAccountForProperty(propertyId, role)`.
- [x] 2.4 Preserve `resolveDemoCredentials()` behavior unchanged.
- [x] 2.5 Re-run `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` and make it pass.

### 3. RED — selector UI tests

- [x] 3.1 Update `src/features/auth/components/__tests__/DemoAccountSelector.test.tsx` to assert both property controls render: Hotel Tarija and Hostal Los Chapacos.
- [x] 3.2 Add a default-state test proving Hotel Tarija is selected initially and Administrator submits `admin+tarija-admin@innhub.dev`.
- [x] 3.3 Add a non-default-property test: select Hostal Los Chapacos, then Manager, and assert `onSelect` receives `admin+loschapacos-manager@innhub.dev` and not Tarija Manager.
- [x] 3.4 Add/accessibility assertion that selected property is visibly or programmatically distinguishable, preferably via `aria-pressed`.
- [x] 3.5 Confirm focused selector tests fail before implementation: `npm run test:run -- src/features/auth/components/__tests__/DemoAccountSelector.test.tsx`.

### 4. GREEN — selector UI implementation

- [x] 4.1 Update `src/features/auth/components/DemoAccountSelector.tsx` to maintain local `selectedPropertyId` state initialized to `DEFAULT_DEMO_PROPERTY_ID`.
- [x] 4.2 Render a property selector section using `getAllDemoProperties()` and i18n property name keys.
- [x] 4.3 Render role buttons from `getDemoAccountsForProperty(selectedPropertyId)` only.
- [x] 4.4 Keep `onSelect` signature as `(credentials: LoginCredentials) => void`; pass only `{ email, password }`.
- [x] 4.5 Ensure the component does not import auth session hooks, InsForge clients, service context, or property-scope helpers.
- [x] 4.6 Re-run focused selector tests and make them pass.

### 5. RED — login integration and i18n tests

- [x] 5.1 Update `src/features/auth/__tests__/LoginForm.test.tsx` so the modal guidance expects property + role selection copy.
- [x] 5.2 Add/adjust LoginForm test to select Hostal Los Chapacos + Manager and assert `signInWithPassword` receives Hostal Manager credentials through the existing auth gateway mock.
- [x] 5.3 Update i18n/locales coverage if present in `src/shared/i18n/__tests__/locales.test.ts` to include new EN/ES keys under `auth.demoSelector`.
- [x] 5.4 Confirm focused failures before implementation: `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/shared/i18n/__tests__/locales.test.ts`.

### 6. GREEN — i18n and login copy implementation

- [x] 6.1 Update `src/shared/i18n/resources/en.ts` with property-aware `auth.demoSelector` keys: guidance, property label, role label, and property names.
- [x] 6.2 Update `src/shared/i18n/resources/es.ts` with aligned Spanish copy that describes selecting demo credentials, not overriding trusted property scope.
- [x] 6.3 Update `src/features/auth/components/LoginForm.tsx` only if needed to use revised i18n copy; preserve modal open/close and `submitCredentials(credentials)` behavior.
- [x] 6.4 Re-run focused LoginForm/i18n tests and make them pass.

### 7. TRIANGULATE — prove mapping and scope boundaries

- [x] 7.1 Add at least one additional assertion for a non-default, non-admin role in `DemoAccountSelector.test.tsx` or `demoCredentials.test.ts` if not already covered.
- [x] 7.2 Add a regression assertion that `DemoAccountSelector` never passes `propertyId` to `onSelect`; expected payload remains exactly `{ email, password }`.
- [x] 7.3 Verify no feature implementation changed `AuthSessionProvider`, `authSessionService`, `insforgeAuthSessionGateway`, RLS migrations, or database seed SQL for this UI feature.

### 8. REFACTOR — keep implementation reviewable

- [x] 8.1 Refactor duplicated role/property rendering logic in `DemoAccountSelector.tsx` only after tests are green.
- [x] 8.2 Keep user-facing strings in `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts`; avoid inline JSX dictionaries.
- [x] 8.3 Check implementation changed-line estimate; if implementation-only diff exceeds 400 lines, pause before completion and split instead of expanding scope.

### 9. Full validation

- [x] 9.1 Run `npm run test:run`.
- [x] 9.2 Run `npm run lint`.
- [x] 9.3 Run `npm run build`.
- [ ] 9.4 Manually smoke test locally or in deployed app: Hotel Tarija + Manager and Hostal Los Chapacos + Manager can both use the modal and reach property-scoped data.
- [x] 9.5 Capture any known unrelated warnings separately; fix all failures before handoff.

### 10. Documentation and handoff

- [x] 10.1 Update this task list completion state during apply.
- [x] 10.2 Summarize evidence for issue #96: modal shows two properties, Hostal credentials work through existing auth flow, and RLS smoke testing is now discoverable.
- [x] 10.3 Keep commits/work units separate from the earlier RLS migration/docs work when committing later.
