# Apply Progress — configure-auth-session

## Workload / PR Boundary

| Field | Value |
| ----- | ----- |
| Current boundary | Work Unit A only — auth session core |
| Delivery strategy | Two PRs using the permanent-branch workflow |
| PR 1 scope | Auth types, service boundary, InsForge adapter, provider/hook, AppProviders wiring, tests |
| PR 2 deferral | Protected route enforcement, real login page, logout UI, i18n copy, route/login/logout tests |
| 400-line budget risk | High |
| Work Unit A changed-line estimate | 771 insertions + 1 deletion in app/test files, excluding OpenSpec artifacts |

Work Unit A exceeds the nominal 400-line budget by itself, mostly because strict-TDD tests and the concrete SDK adapter are included with the reviewable auth-session core. The issue remains split from Work Unit B to avoid combining route/login/logout enforcement with this core boundary.

## Completed Tasks

- A1 RED auth session service tests.
- A2 GREEN auth types and session assembly.
- A3 TRIANGULATE InsForge adapter boundary.
- A4 RED provider and hook tests.
- A5 GREEN `AuthSessionProvider`, `useAuthSession`, and `AppProviders` wiring.
- A6 REFACTOR core boundary cleanup and final validation.

## Files Changed

| File | Change |
| ---- | ------ |
| `src/features/auth/types.ts` | Added typed auth user, profile, app session, session states, login result, and gateway result contracts. |
| `src/features/auth/services/authSessionService.ts` | Added `AuthSessionGateway`, session assembly, safe login result mapping, and logout state clearing. |
| `src/features/auth/services/insforgeAuthSessionGateway.ts` | Added InsForge Auth/database adapter using the existing shared client boundary. |
| `src/features/auth/AuthSessionProvider.tsx` | Added provider with gateway injection, loading/refresh/login/logout behavior, and configuration-error handling. |
| `src/features/auth/authSessionContext.ts` | Added shared context/value type for provider and hook separation. |
| `src/features/auth/hooks/useAuthSession.ts` | Added consumer hook with a clear outside-provider error. |
| `src/features/auth/index.ts` | Added narrow auth feature exports. |
| `src/features/auth/__tests__/authSessionService.test.ts` | Added strict-TDD service tests with fake gateway coverage. |
| `src/features/auth/__tests__/AuthSessionProvider.test.tsx` | Added strict-TDD provider/hook tests with fake gateway coverage. |
| `src/app/providers/AppProviders.tsx` | Wrapped the existing i18n provider content with `AuthSessionProvider`. |
| `openspec/changes/configure-auth-session/tasks.md` | Marked Work Unit A tasks complete and recorded the resolved two-PR chain strategy. |

## TDD Cycle Evidence

| Work Unit | Phase | Evidence | Command | Result |
| --------- | ----- | -------- | ------- | ------ |
| A1 | RED | Added `authSessionService.test.ts` before service/types existed. | `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts` | FAIL expected — missing `../services/authSessionService`. |
| A2 | GREEN | Added `types.ts` and `authSessionService.ts` for session assembly and safe login errors. | `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts` | PASS — 1 file, 6 tests. |
| A3 | TRIANGULATE | Confirmed local SDK docs/types and added `insforgeAuthSessionGateway.ts` behind `createInsForgeClient`. | `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts`, `npm run build` | PASS — focused service tests passed; build passed. |
| A4 | RED | Added `AuthSessionProvider.test.tsx` before provider/hook existed. | `npm run test:run -- src/features/auth/__tests__/AuthSessionProvider.test.tsx` | FAIL expected — missing `../AuthSessionProvider`. |
| A5 | GREEN | Added provider, context, hook, exports, and AppProviders wiring. | `npm run test:run -- src/features/auth/__tests__/AuthSessionProvider.test.tsx` | PASS — 1 file, 4 tests. |
| A6 | REFACTOR | Moved hook/context out of provider file to satisfy React Refresh lint and kept InsForge access inside the adapter. | `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts src/features/auth/__tests__/AuthSessionProvider.test.tsx`, `npm run lint` | PASS — focused auth tests passed, lint passed. |

## Validation Commands

| Command | Result |
| ------- | ------ |
| `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts` | PASS — 1 file, 6 tests after GREEN. |
| `npm run test:run -- src/features/auth/__tests__/AuthSessionProvider.test.tsx` | PASS — 1 file, 4 tests after GREEN/refactor. |
| `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts src/features/auth/__tests__/AuthSessionProvider.test.tsx` | PASS — 2 files, 10 tests. |
| `npm run test:run` | PASS — 13 files, 60 tests. |
| `npm run lint` | PASS — no errors or warnings after moving the hook/context out of the provider component file. |
| `npm run build` | PASS — TypeScript and Vite build completed. Vite reported an existing-style chunk-size warning for the built app bundle. |
| Parent rerun: `npm run test:run` | PASS — 13 files, 60 tests. |
| Parent rerun: `npm run lint` | PASS — no errors or warnings. |
| Parent rerun: `npm run build` | PASS — TypeScript and Vite build completed with the same Vite chunk-size warning. |
| Parent LSP diagnostics | PASS — no diagnostics in Work Unit A auth/provider files. |
| Fresh review | BLOCKED — `logout()` ignored `signOut()` failures and could clear local state while the remote InsForge session remained active. |
| Blocker fix focused test | PASS — `authSessionService.test.ts` now has 7 tests, including failed sign-out handling. |
| Blocker fix full test | PASS — 13 files, 61 tests. |
| Blocker fix lint | PASS — no errors or warnings. |
| Blocker fix build | PASS — TypeScript and Vite build completed with the same Vite chunk-size warning. |

## Decisions and Discoveries

- The installed `@insforge/sdk@1.2.10` exposes `client.auth.signInWithPassword`, `client.auth.getCurrentUser`, `client.auth.signOut`, and `client.database.from("profiles")`.
- The adapter uses `.select(...).eq(...).limit(1)` and reads the first returned row instead of `.maybeSingle()` because the confirmed local types expose the PostgREST builder broadly, and this keeps the query helper choice simple and typed inside the adapter boundary.
- `profile_role` in the committed migration uses `administrator`, not `admin`; Work Unit A types follow the migration enum.
- `AuthSessionProvider` catches missing frontend InsForge env/config and exposes `invalid/configuration-error` instead of throwing during public route rendering or tests.
- The hook/context were split from `AuthSessionProvider.tsx` so React Fast Refresh lint remains clean.
- Fresh review found that `logout()` ignored `signOut()` failures. The service now returns `invalid/auth-error` if the auth boundary cannot sign out, and the service test suite covers that path without exposing raw token payloads.

## Deviations from Design

- The provider uses `window.setTimeout(..., 0)` to start the initial refresh from an effect. This avoids React 19 lint warnings about synchronous state updates in effects while preserving an initial `loading` state.
- No adapter-specific SDK mock test was added. Service and provider tests mock the `AuthSessionGateway`, and the adapter is kept narrow for later integration verification.

## Remaining Tasks

- Work Unit B: protected route enforcement for `/app/*`.
- Work Unit B: replace the login placeholder with MVP email/password login.
- Work Unit B: add logout UI in the protected shell.
- Work Unit B: add necessary i18n copy and route/login/logout tests.
- Final SDD verify, sync, and archive after both work units are complete.

## Work Unit B Update — Route, Login, and Logout Enforcement

## Workload / PR Boundary

| Field | Value |
| ----- | ----- |
| Current boundary | Work Unit B only — route/login/logout enforcement |
| PR 2 scope | Protected route guard, real login page/form, logout action, auth i18n copy, route/login/logout tests |
| Work Unit A status | Already merged to QA and synchronized back to `features` before this work |
| Work Unit B changed-line estimate | ~540 insertions + 79 deletions in app/test files, excluding OpenSpec artifacts |
| 400-line budget risk | High |

Work Unit B is intentionally limited to consuming the Work Unit A provider/hook. It does not redo the auth service/gateway core and does not introduce schema changes, seed data, Storage, RBAC, registration/reset, user management CRUD, feature CRUD, or issue #7 data-access enforcement.

## Completed Tasks

- B1 RED protected route behavior tests.
- B2 GREEN `ProtectedLayout` guard.
- B3 RED login/logout interaction tests.
- B4 GREEN login page and logout UI.
- B5 TRIANGULATE i18n and safe state copy.
- B6 REFACTOR route/UI boundary cleanup and final validation.

## Files Changed

| File | Change |
| ---- | ------ |
| `src/app/__tests__/App.routing.test.tsx` | Updated routing tests from structural-only protected shell expectations to real auth enforcement using fake auth gateways; added logout route behavior coverage. |
| `src/features/auth/__tests__/LoginForm.test.tsx` | Added login form interaction tests for required fields, UI-safe invalid credential errors, and valid login callback behavior. |
| `src/app/layouts/ProtectedLayout.tsx` | Added `useAuthSession()` guard for loading, unauthenticated, invalid, and authenticated states. |
| `src/app/pages/LoginPage.tsx` | Replaced the public login placeholder with an MVP login page that preserves the intended `/app/*` redirect path. |
| `src/app/pages/LoginPlaceholderPage.tsx` | Removed the structural placeholder page. |
| `src/features/auth/components/LoginForm.tsx` | Added MVP email/password form using the auth provider boundary only. |
| `src/app/routes/routes.tsx` | Pointed `/login` to `LoginPage`. |
| `src/app/shell/TopBar.tsx` | Added compact authenticated logout action and optional profile label. |
| `src/shared/i18n/resources/en.ts` | Added English auth/login/session/logout copy and updated shell copy from preview to authenticated workspace. |
| `src/shared/i18n/resources/es.ts` | Added Spanish auth/login/session/logout copy aligned with the English resource. |
| `openspec/changes/configure-auth-session/tasks.md` | Marked Work Unit B tasks complete. |

## TDD Cycle Evidence — Work Unit B

| Work Unit | Phase | Evidence | Command | Result |
| --------- | ----- | -------- | ------- | ------ |
| B1 | RED | Updated `App.routing.test.tsx` to require protected route blocking, loading state without shell, invalid session blocking, valid-session shell rendering, and a real `/login` form. | `npm run test:run -- src/app/__tests__/App.routing.test.tsx` | FAIL expected — structural `ProtectedLayout` still rendered the shell and `/login` still used the placeholder. |
| B3 | RED | Added `LoginForm.test.tsx` before `LoginForm` existed to cover required credentials, invalid credential copy, and valid login callback behavior. | `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx` | FAIL expected — missing `../components/LoginForm`. |
| B2 | GREEN | Added `ProtectedLayout` session guard and public-safe loading/invalid states without `AppShell`. | `npm run test:run -- src/app/__tests__/App.routing.test.tsx src/features/auth/__tests__/LoginForm.test.tsx` | PASS — route guard cases passed after login page/form were added. |
| B4 | GREEN | Added `LoginForm`, `LoginPage`, preserved `/app/*` redirect, and compact logout action in `TopBar`; added logout route behavior coverage. | `npm run test:run -- src/app/__tests__/App.routing.test.tsx src/features/auth/__tests__/LoginForm.test.tsx` | PASS — 2 files, 10 tests. |
| B5 | TRIANGULATE | Added bilingual auth/session/logout copy and ensured invalid credential tests do not render raw token payloads. | `npm run test:run` | PASS — 14 files, 68 tests. |
| B6 | REFACTOR | Reviewed route/UI boundaries for direct InsForge usage and scope creep. | `npm run test:run`, `npm run lint`, `npm run build` | PASS — full tests, lint, and build passed; Vite chunk-size warning remains non-blocking. |

## Validation Commands — Work Unit B

| Command | Result |
| ------- | ------ |
| `npm run test:run -- src/app/__tests__/App.routing.test.tsx` | FAIL expected during RED — protected shell still rendered for unauthenticated/loading/invalid route tests and login form did not exist yet. |
| `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx` | FAIL expected during RED — missing `../components/LoginForm`. |
| `npm run test:run -- src/app/__tests__/App.routing.test.tsx src/features/auth/__tests__/LoginForm.test.tsx` | PASS — 2 files, 10 tests after GREEN/refactor. |
| `npm run test:run` | PASS — 14 files, 68 tests. |
| `npm run lint` | PASS — no errors or warnings. |
| `npm run build` | PASS — TypeScript and Vite build completed. Vite reported the existing-style chunk-size warning for the built app bundle. |
| Fresh review | BLOCKED — `LoginForm` rendered arbitrary `LoginResult.message`, so SDK/error payload text could appear in UI. |
| Blocker fix focused test | PASS — `LoginForm.test.tsx` verifies a generic UI-safe login error and no raw secret/error text. |
| Blocker fix full test | PASS — 14 files, 68 tests. |
| Blocker fix lint | PASS — no errors or warnings. |
| Blocker fix build | PASS — TypeScript and Vite build completed with the same Vite chunk-size warning. |

## Decisions and Discoveries — Work Unit B

- Unauthenticated protected routes redirect to `/login` with router state preserving the originally requested `/app/*` path.
- Successful login navigates to the preserved `/app/*` path when available, otherwise `/app/dashboard`.
- Invalid profile/property/auth states render a public-safe message without `AppShell`; they do not silently log the user out.
- `LoginForm` uses React local state instead of React Hook Form to keep this MVP login slice small.
- Fresh review found the first Work Unit B implementation rendered arbitrary `LoginResult.message`; the blocker was fixed so failed login attempts always render generic i18n copy instead of gateway/SDK error text.
- Logout is a compact `TopBar` action; after successful provider logout, the guard redirects the user to `/login` and protected content stops rendering.
- Route/UI files do not import `@insforge/sdk`, `createInsForgeClient`, or the InsForge adapter. They consume `useAuthSession()` only.

## Deviations from Design — Work Unit B

- None significant. The preferred redirect behavior was implemented, including preserving `/app/*` intent through login.

## Remaining Tasks

- Run independent verify after Work Unit B review.
- Sync `auth-session` into canonical OpenSpec specs after the full issue #5 scope is verified.
- Archive `openspec/changes/configure-auth-session/` after sync and verification pass.
