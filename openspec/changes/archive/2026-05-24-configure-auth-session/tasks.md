# Tasks — configure-auth-session

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 550-910 excluding OpenSpec artifacts |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 Work Unit A auth session core → PR 2 Work Unit B route/login/logout enforcement |
| Delivery strategy | auto-chain |
| Chain strategy | two-pr-permanent-branch |

Decision needed before apply: No — owner approved two PRs and Work Unit A first.
Chained PRs recommended: Yes
Chain strategy: two-pr-permanent-branch
400-line budget risk: High

## Scope Guardrails

- Implement issue #5 only: authentication/session foundation, profile lookup, single-property session context, protected-route enforcement, MVP login/logout.
- Keep issue #7 property-scoped data access enforcement, RLS/policies, and feature-service filtering out of scope.
- Keep issue #8 seed/demo data out of scope except test-local fakes.
- Do not add registration, password reset, MFA, OAuth/social login, invitations, user-management CRUD, feature CRUD, realtime, Storage buckets/uploads/file metadata, payment behavior, schema changes, or broad UI redesign.
- Components must not create InsForge clients or call InsForge auth/database APIs directly.
- Before apply, resolve chain strategy with the project owner because the forecast is above the 400-line review budget.

## Work Unit A — Auth Session Core

Goal: create the auth/session domain boundary without changing protected route behavior or login UI beyond what tests require.

Rollback boundary: remove `src/features/auth/` core files and restore `src/app/providers/AppProviders.tsx` to its previous provider composition.

### A1. RED — Auth session service tests

- [x] Add failing tests in `src/features/auth/__tests__/authSessionService.test.ts` using a fake `AuthSessionGateway`.
- [x] Cover concrete cases from `openspec/changes/configure-auth-session/specs/auth-session/spec.md`:
  - `getCurrentUser` returns `null` -> `unauthenticated`;
  - authenticated user + active profile + property -> `authenticated` with `propertyId`;
  - missing profile -> `invalid` / `missing-profile`;
  - inactive profile -> `invalid` / `inactive-profile`;
  - missing or blank property -> `invalid` / `missing-property`;
  - login failure returns a UI-safe error and does not expose tokens/raw SDK payloads.
- [x] Run `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts` and record the expected RED failure in `openspec/changes/configure-auth-session/apply-progress.md` during apply.

### A2. GREEN — Auth types and session assembly

- [x] Create `src/features/auth/types.ts` with `AuthUser`, `AppProfile`, `AppSession`, `AuthSessionState`, `InvalidSessionReason`, `LoginCredentials`, and `LoginResult`.
- [x] Create `src/features/auth/services/authSessionService.ts` with `AuthSessionGateway`, `buildAppSession`, `buildAppSessionForUser`, and login/logout helpers if needed.
- [x] Ensure service logic maps invalid states without rendering or logging secrets.
- [x] Run `npm run test:run -- src/features/auth/__tests__/authSessionService.test.ts` and confirm GREEN.

### A3. TRIANGULATE — InsForge adapter boundary

- [x] Confirm installed SDK typing in concrete discovery targets:
  - `node_modules/@insforge/sdk/dist/index.d.ts`;
  - `node_modules/@insforge/sdk/README.md`.
- [x] Create `src/features/auth/services/insforgeAuthSessionGateway.ts` using the existing `src/shared/services/insforgeClient.ts` boundary.
- [x] Keep SDK calls limited to the adapter:
  - `client.auth.signInWithPassword({ email, password })`;
  - `client.auth.getCurrentUser()`;
  - `client.auth.signOut()`;
  - `client.database.from("profiles")` profile lookup by `auth_user_id`.
- [x] If `.maybeSingle()` is not available in installed types, use the smallest typed equivalent and document the choice in `apply-progress.md`.
- [x] Add/adjust adapter-focused tests only if they can mock the gateway/client boundary without brittle SDK internals.
- [x] Run focused auth tests and confirm they still pass.

### A4. RED — Provider and hook tests

- [x] Add failing tests in `src/features/auth/__tests__/AuthSessionProvider.test.tsx`.
- [x] Cover:
  - provider starts in loading and resolves through `refresh()`;
  - `useAuthSession()` exposes `state`, `login`, `logout`, and `refresh`;
  - logout sets `unauthenticated` after an authenticated state;
  - `useAuthSession()` outside provider throws a clear error.
- [x] Use a fake `AuthSessionGateway`; do not require live InsForge or real env values.
- [x] Run `npm run test:run -- src/features/auth/__tests__/AuthSessionProvider.test.tsx` and record RED evidence.

### A5. GREEN — AuthSessionProvider and hook

- [x] Create `src/features/auth/AuthSessionProvider.tsx` with optional `gateway` injection and production default adapter creation.
- [x] Create `src/features/auth/hooks/useAuthSession.ts` or export the hook from the provider if that keeps the API smaller.
- [x] Wire `login(credentials)`, `logout()`, and `refresh()` through the session service/gateway.
- [x] Update `src/app/providers/AppProviders.tsx` to wrap children with `AuthSessionProvider` inside the existing i18n provider.
- [x] Keep provider state codes UI-copy-free and i18n-independent.
- [x] Run auth service/provider focused tests and confirm GREEN.

### A6. REFACTOR — Core boundary cleanup

- [x] Review `src/features/auth/**/*` to ensure JSX components do not call InsForge directly and service files do not import app shell/layout code.
- [x] Keep exported API narrow, preferably via `src/features/auth/index.ts` only if it reduces import noise.
- [x] Run `npm run test:run`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Record validation results and changed-line estimate for Work Unit A in `openspec/changes/configure-auth-session/apply-progress.md`.

## Work Unit B — Route, Login, and Logout Enforcement

Goal: use the auth session core to enforce `/app/*`, replace the login placeholder with MVP login, and add logout from the protected shell.

Start condition: Work Unit A is merged/accepted or available in the selected chain strategy.

Rollback boundary: restore structural `ProtectedLayout`, restore `/login` placeholder route/page, remove login/logout UI and related i18n/tests while keeping Work Unit A core intact.

### B1. RED — Protected route behavior tests

- [x] Update `src/app/__tests__/App.routing.test.tsx` with failing tests for issue #5 behavior.
- [x] Cover:
  - unauthenticated `/app/dashboard` does not render protected sidebar/topbar/workspace and reaches `/login` or login-required UI;
  - loading state does not render protected shell content;
  - invalid profile/property state does not render protected shell content;
  - authenticated valid session renders dashboard through the existing shell;
  - `/login` renders a real login form outside the protected shell.
- [x] Use injected fake auth state/gateway so tests do not depend on live InsForge.
- [x] Run `npm run test:run -- src/app/__tests__/App.routing.test.tsx` and record RED evidence.

### B2. GREEN — ProtectedLayout guard

- [x] Update `src/app/layouts/ProtectedLayout.tsx` to switch on `useAuthSession().state`.
- [x] For `loading`, render a public-safe loading state without `AppShell`.
- [x] For `unauthenticated`, redirect to `/login` with optional `from` location state or render a login-required path, as finalized during apply.
- [x] For `invalid`, render a public-safe invalid-session message or recovery path without `AppShell`.
- [x] For `authenticated`, render existing `AppShell` + `Outlet` behavior.
- [x] Run the focused routing tests and confirm the guard cases pass.

### B3. RED — Login/logout interaction tests

- [x] Add or update tests for login/logout interactions in concrete targets:
  - `src/features/auth/__tests__/LoginForm.test.tsx`, if a separate form component is created;
  - `src/app/__tests__/App.routing.test.tsx`, if route-level behavior is enough.
- [x] Cover:
  - required email/password validation or disabled submit behavior;
  - valid credentials call provider `login` and navigate to the intended route or `/app/dashboard`;
  - invalid credentials show a UI-safe error;
  - logout prevents protected content from continuing to render.
- [x] Run focused tests and record RED evidence.

### B4. GREEN — Login page and logout UI

- [x] Replace or rename `src/app/pages/LoginPlaceholderPage.tsx` to `src/app/pages/LoginPage.tsx` and update `src/app/routes/routes.tsx`.
- [x] Create `src/features/auth/components/LoginForm.tsx` if it keeps login UI small and testable; otherwise keep minimal form logic in `LoginPage.tsx`.
- [x] Implement MVP email/password login with local state or existing React Hook Form only if it reduces code.
- [x] On successful login, navigate to preserved `from` path if practical; otherwise navigate to `/app/dashboard` and document the simpler MVP behavior.
- [x] Add compact logout action in the existing shell target, such as `src/app/shell/TopBar.tsx` or `src/app/shell/AppShell.tsx`.
- [x] Do not add registration/reset/user-management links unless inert and explicitly marked out of scope.
- [x] Run focused login/logout/routing tests and confirm GREEN.

### B5. TRIANGULATE — i18n and safe state copy

- [x] Update only necessary user-facing strings in:
  - `src/shared/i18n/resources/en.ts`;
  - `src/shared/i18n/resources/es.ts`.
- [x] Include copy for login labels, loading/auth-required state, invalid profile/property state, safe auth error, and logout.
- [x] Ensure errors never render tokens, anon keys, JWTs, or raw SDK error payloads.
- [x] Run `npm run test:run` and fix any i18n or route regressions.

### B6. REFACTOR — Route/UI boundary cleanup

- [x] Inspect `src/app/layouts/ProtectedLayout.tsx`, `src/app/pages/LoginPage.tsx`, `src/app/shell/*`, and `src/features/auth/components/*` for direct InsForge imports or client creation.
- [x] Confirm protected route tests from issue #3 were intentionally updated from structural-only expectations to real auth enforcement.
- [x] Confirm no feature CRUD, seed data, Storage, RBAC, registration/reset, or issue #7 enforcement slipped into the diff.
- [x] Run final validation commands:
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [x] Record validation results and changed-line estimate for Work Unit B in `openspec/changes/configure-auth-session/apply-progress.md`.

## Final SDD Closeout Tasks

- [x] Review `openspec/changes/configure-auth-session/proposal.md`, `specs/auth-session/spec.md`, `design.md`, and this `tasks.md` for consistency after apply.
- [x] Ensure `openspec/changes/configure-auth-session/apply-progress.md` records strict-TDD RED/GREEN/TRIANGULATE/REFACTOR evidence for both work units.
- [x] Run final verification after all selected work units are accepted:
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [x] During verify, confirm acceptance criteria from `openspec/changes/configure-auth-session/specs/auth-session/spec.md` and issue #5.
- [x] Sync `auth-session` into canonical OpenSpec specs only after the full issue #5 scope is verified.
- [x] Archive `openspec/changes/configure-auth-session/` only after sync and verification pass.

## PR / Delivery Notes

- Recommended split is mandatory unless the project owner approves a size exception before apply.
- Work Unit A and Work Unit B should each have clear apply/verify evidence and rollback boundaries.
- If using the existing permanent-branch workflow rather than temporary feature branches, ask the project owner how to map the two work units into PRs before implementation.
- Keep GitHub issue comments in English for InnHub project artifacts.
