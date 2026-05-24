# Design — configure-auth-session

## Change ID

`configure-auth-session`

## Related Issue

- Issue #5: `feat(auth): configure authentication and user session`

## Design Summary

Issue #5 upgrades InnHub's existing structural routing foundation into a real authenticated application boundary. The implementation should add an auth feature module, a typed app-session provider/hook, a service adapter around InsForge Auth and profile lookup, and route enforcement that blocks `/app/*` until the current user has a valid active profile with exactly one `property_id`.

The design intentionally keeps issue #5 narrow: it establishes identity and current-property context for the frontend, but does not implement registration, password recovery, RBAC gates, user management CRUD, seed data, Storage, feature CRUD, or issue #7 property-scoped data access enforcement.

## Source Inputs Consulted

- `openspec/changes/configure-auth-session/proposal.md`
- `openspec/changes/configure-auth-session/specs/auth-session/spec.md`
- `openspec/specs/app-routing/spec.md`
- `openspec/specs/backend-environment/spec.md`
- `openspec/specs/database-schema/spec.md`
- `docs/05-architecture.md`
- `docs/07-functional-specification.md`
- `AGENTS.md`
- `src/shared/services/insforgeClient.ts`
- `src/app/routes/routes.tsx`
- `src/app/layouts/ProtectedLayout.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/app/pages/LoginPlaceholderPage.tsx`
- `src/app/shell/AppShell.tsx`
- `src/app/__tests__/App.routing.test.tsx`
- `node_modules/@insforge/sdk/README.md`
- `node_modules/@insforge/sdk/dist/index.d.ts`

## InsForge SDK Facts Confirmed Locally

No MCP-specific InsForge auth tool was available in this subagent runtime. Local installed SDK documentation and type definitions were consulted instead.

Confirmed from `@insforge/sdk@1.2.10` local docs/types:

| Area | Confirmed API |
| ---- | ------------- |
| Client creation | `createClient({ baseUrl, anonKey })`, already wrapped by `createInsForgeClient` |
| Password login | `client.auth.signInWithPassword({ email, password })` |
| Current user | `client.auth.getCurrentUser()` returns `{ data: { user }, error }` |
| Logout | `client.auth.signOut()` |
| Database query | `client.database.from("profiles")` returns a PostgREST query builder |
| SDK client type | `InsForgeClient` exposes `auth`, `database`, `storage`, `realtime`, etc. |

Design implication: concrete SDK calls may be used inside a feature auth service, but UI/provider code should depend on a small local `AuthSessionGateway` interface so tests do not need to mock SDK internals. If apply discovers an SDK response-shape mismatch against a real backend, adjust the adapter only and record the deviation in apply evidence.

## Current State

The app already has:

- `AppProviders` with i18n only;
- public routes `/` and `/login`;
- protected route group under `/app`;
- `ProtectedLayout` that currently renders the shell unconditionally;
- `LoginPlaceholderPage` that links directly into `/app/dashboard`;
- route tests asserting the structural protected layout renders without auth;
- InsForge client config boundary in `src/shared/services/insforgeClient.ts`.

Issue #5 changes the expectation for protected routing tests: `/app/*` must not render shell landmarks unless the session boundary reports a valid app session.

## Architecture Decisions

| Decision | Design |
| -------- | ------ |
| Auth feature ownership | Add auth-specific code under `src/features/auth/`. |
| InsForge boundary | Components never call InsForge; only `features/auth` service/adapter uses `createInsForgeClient` or an injected `InsForgeClient`. |
| App session state | App-wide session lives in an `AuthSessionProvider` composed by `AppProviders`. |
| Consumer API | Frontend consumers use `useAuthSession()` and action helpers exposed by the provider. |
| Route guard | `ProtectedLayout` becomes a guard: loading renders a neutral loading state, unauthenticated redirects/blocks to `/login`, invalid session renders a safe auth error path, authenticated renders `AppShell + Outlet`. |
| Login UI | Replace the placeholder with an MVP email/password form. No registration/reset links unless inert or explicitly marked out of scope. |
| Logout UI | Add a compact logout action in the protected shell/topbar, wired through the provider, without user-management UI. |
| Profile lookup | After a valid InsForge user is found, resolve the InnHub profile from `profiles.auth_user_id`. |
| Property context | A valid app session includes exactly one `propertyId` derived from `profiles.property_id`. No separate current-property selector in MVP. |
| Invalid states | Missing profile, inactive profile, missing property, auth/profile lookup errors, and config errors do not render protected content. |
| Data-access enforcement | Later feature services may consume `propertyId`, but full property filtering/RLS/service enforcement remains issue #7. |

## Proposed File Plan

Exact implementation can rename files if tasks/apply finds a smaller path, but keep the same boundaries.

```text
src/
├── app/
│   ├── layouts/
│   │   └── ProtectedLayout.tsx          # guard + shell composition
│   ├── pages/
│   │   └── LoginPage.tsx                # replace placeholder or rename existing page
│   ├── providers/
│   │   └── AppProviders.tsx             # wraps I18n + AuthSessionProvider
│   ├── routes/
│   │   └── routes.tsx                   # points /login to real login page
│   └── shell/
│       └── TopBar.tsx / AppShell.tsx    # logout/current profile display, if needed
└── features/
    └── auth/
        ├── components/
        │   ├── AuthStateMessage.tsx     # optional shared loading/invalid state view
        │   └── LoginForm.tsx
        ├── hooks/
        │   └── useAuthSession.ts
        ├── services/
        │   └── authSessionService.ts
        ├── types.ts
        ├── AuthSessionProvider.tsx
        └── __tests__/
            ├── authSessionService.test.ts
            └── AuthSessionProvider.test.tsx
```

Tests may also update or add:

```text
src/app/__tests__/App.routing.test.tsx
```

Avoid creating broad shared form components for this issue. Use existing generic `Button` only if it reduces duplication without expanding shared UI scope.

## Data Contracts

### Auth user

Use the SDK user object as an opaque external identity source. The auth service should normalize only the fields needed by the app:

```ts
export type AuthUser = {
  readonly id: string;
  readonly email?: string;
};
```

`id` maps to `profiles.auth_user_id`.

### Profile row

```ts
export type AppProfile = {
  readonly id: string;
  readonly authUserId: string;
  readonly propertyId: string;
  readonly role: "admin" | "manager" | "receptionist" | "housekeeping" | "maintenance";
  readonly status: "active" | "inactive";
  readonly fullName?: string | null;
};
```

If exact enum values in SQL differ by implementation details, use the values from `database/migrations/001_define_core_innhub_schema.sql` during apply. The provider should only allow `status === "active"` into an authenticated app session.

### App session state

Use a discriminated union so protected routes cannot accidentally treat unresolved or invalid states as valid:

```ts
export type AuthSessionState =
  | { readonly status: "loading" }
  | { readonly status: "unauthenticated" }
  | { readonly status: "authenticated"; readonly session: AppSession }
  | { readonly status: "invalid"; readonly reason: InvalidSessionReason };

export type AppSession = {
  readonly user: AuthUser;
  readonly profile: AppProfile;
  readonly propertyId: string;
};

export type InvalidSessionReason =
  | "missing-profile"
  | "inactive-profile"
  | "missing-property"
  | "auth-error"
  | "profile-error"
  | "configuration-error";
```

The provider API should expose:

```ts
export type AuthSessionContextValue = {
  readonly state: AuthSessionState;
  readonly login: (credentials: LoginCredentials) => Promise<LoginResult>;
  readonly logout: () => Promise<void>;
  readonly refresh: () => Promise<void>;
};
```

`LoginResult` should be UI-safe and never expose tokens or raw SDK secrets.

## Service Boundary Design

### Gateway interface

Create an adapter-facing interface that can be faked in tests:

```ts
export type AuthSessionGateway = {
  readonly signInWithPassword: (credentials: LoginCredentials) => Promise<AuthGatewayResult<AuthUser>>;
  readonly getCurrentUser: () => Promise<AuthGatewayResult<AuthUser | null>>;
  readonly signOut: () => Promise<AuthGatewayResult<void>>;
  readonly findProfileByAuthUserId: (authUserId: string) => Promise<AuthGatewayResult<AppProfile | null>>;
};
```

### InsForge implementation

`createInsForgeAuthSessionGateway(client = createInsForgeClient())` should own all SDK calls:

- `client.auth.signInWithPassword({ email, password })`;
- `client.auth.getCurrentUser()`;
- `client.auth.signOut()`;
- `client.database.from("profiles")...` for profile lookup.

Suggested profile query shape:

```ts
client.database
  .from("profiles")
  .select("id, auth_user_id, property_id, role, status, full_name")
  .eq("auth_user_id", authUserId)
  .maybeSingle();
```

Because exact PostgREST helper availability should be verified during apply against installed types, the adapter may use `.single()` or equivalent if `.maybeSingle()` is unavailable. Keep this uncertainty inside the adapter and tests.

### Session assembly service

Create a pure-ish session assembly function that can be unit tested without React:

```ts
export async function buildAppSession(gateway: AuthSessionGateway): Promise<AuthSessionState>;
export async function buildAppSessionForUser(
  gateway: AuthSessionGateway,
  user: AuthUser,
): Promise<AuthSessionState>;
```

Rules:

1. no user -> `unauthenticated`;
2. auth error -> `invalid/auth-error` or `unauthenticated` depending on SDK error semantics, but never authenticated;
3. no profile -> `invalid/missing-profile`;
4. inactive profile -> `invalid/inactive-profile`;
5. missing/blank `propertyId` -> `invalid/missing-property`;
6. active profile + property -> `authenticated`.

This isolates the most important business decision from JSX and makes strict TDD easier.

## Provider and Hook Design

`AuthSessionProvider` should:

1. accept an optional `gateway` prop for tests;
2. default to `createInsForgeAuthSessionGateway()` in production;
3. start in `loading`;
4. run `refresh()` on mount;
5. expose `login(credentials)` that calls the gateway, then builds a session for the returned user;
6. expose `logout()` that calls the gateway and then sets `unauthenticated`;
7. catch errors and map them into UI-safe invalid states or login errors.

`useAuthSession()` should throw a clear error if used outside the provider. This prevents consumers from accidentally operating without a session boundary.

`AppProviders` should wrap providers in this order:

```tsx
<I18nextProvider i18n={i18n}>
  <AuthSessionProvider>{children}</AuthSessionProvider>
</I18nextProvider>
```

The auth provider may use i18n-independent state codes; UI copy belongs in components/resources.

## Protected Route Behavior

`ProtectedLayout` should switch on `state.status`:

| State | Behavior |
| ----- | -------- |
| `loading` | Render a public-safe loading view, no sidebar/topbar/workspace content. |
| `unauthenticated` | Redirect to `/login` with optional `from` location state, or render a login-required page linking to `/login`. Do not render `AppShell`. |
| `invalid` | Render a public-safe invalid-session page or redirect to `/login` with an error state. Do not render `AppShell`. |
| `authenticated` | Render `AppShell` and `Outlet` exactly like the structural layout does today. |

Preferred behavior: redirect unauthenticated users to `/login` preserving the intended path in router state, then redirect to the original `/app/*` path after successful login. If this adds too much test/UI complexity, redirect to `/app/dashboard` after login and document the simpler MVP behavior in apply evidence.

Invalid profile states should not silently log the user out unless design/apply documents that choice. A visible safe message such as "Your account is not linked to an active InnHub profile" is acceptable.

## Login and Logout UI

### Login page

Replace `LoginPlaceholderPage` with a real login page or rename it to `LoginPage`.

Minimum UI:

- email input;
- password input;
- submit button;
- loading/disabled submit state;
- authentication error message;
- invalid profile/property message after login if applicable.

Use React local state or React Hook Form if already worthwhile. Since this issue does not need complex validation, React local state plus simple required checks is acceptable and likely smaller. Do not add dependencies.

On successful authenticated app session:

- navigate to preserved `from` path if available;
- otherwise navigate to `/app/dashboard`.

### Logout

Add a compact logout button in `TopBar` or another existing shell location.

Minimum behavior:

- calls provider `logout()`;
- after logout, protected content stops rendering;
- navigation moves to `/login` or route guard redirects on next render.

Displaying profile name/email in the topbar is optional. If implemented, keep it compact and read only from `state.session`, not direct services.

## Error and Secret Handling

- Never render access tokens, refresh tokens, anon keys, JWTs, or raw SDK error payloads.
- Map SDK errors to generic UI copy such as "Invalid email or password" or "We could not load your InnHub profile".
- Do not enable SDK debug logging.
- Missing `VITE_INSFORGE_*` configuration should produce a safe configuration-error state or an app-level error message without echoing values.

## Tests and Strict TDD Plan

Future apply must start with failing tests and record RED/GREEN evidence in `apply-progress.md`.

Recommended test groups:

### 1. Service/session assembly tests

File: `src/features/auth/__tests__/authSessionService.test.ts`

Cover:

- `getCurrentUser` returns null -> `unauthenticated`;
- authenticated user + active profile + property -> `authenticated` with `propertyId`;
- missing profile -> `invalid/missing-profile`;
- inactive profile -> `invalid/inactive-profile`;
- missing property -> `invalid/missing-property`;
- login failure returns UI-safe error and does not authenticate;
- logout clears session path through provider or service.

Use fake `AuthSessionGateway`; do not mock SDK internals.

### 2. Provider/hook tests

File: `src/features/auth/__tests__/AuthSessionProvider.test.tsx`

Cover:

- provider starts loading and resolves to unauthenticated/authenticated;
- `useAuthSession` exposes login/logout/refresh;
- logout sets unauthenticated after an authenticated state;
- hook outside provider throws a clear error.

### 3. Routing tests

Update: `src/app/__tests__/App.routing.test.tsx`

Cover:

- unauthenticated `/app/dashboard` does not render sidebar/topbar/workspace and reaches `/login` or login-required UI;
- authenticated valid session renders dashboard through shell;
- invalid profile state does not render shell;
- `/login` renders real login form outside protected shell.

Provider injection for route tests should avoid live InsForge/env access. Options:

1. export a test helper provider composition that injects a fake gateway;
2. let `AuthSessionProvider` accept `gateway` and add a small test-only wrapper around routes;
3. keep app routes pure and render them under custom providers in tests.

### 4. UI interaction tests

If login form implementation is non-trivial, add tests for:

- submitting valid credentials calls login and navigates to app;
- invalid credentials show a safe error;
- logout button returns user to login or causes protected guard to block shell.

## Validation Commands

Future apply/verify should run:

```bash
npm run test:run
npm run lint
npm run build
```

`npm run test:run` is mandatory for strict TDD. `npm run lint` and `npm run build` are required before reporting complete because this issue changes TypeScript/React app code.

## Review Workload Forecast

Estimated changed lines, excluding OpenSpec artifacts:

| Area | Estimated changed lines |
| ---- | ----------------------- |
| Auth types/service/gateway | 120-180 |
| Auth provider/hook | 90-140 |
| Login page/form | 80-140 |
| Protected route/topbar logout changes | 50-100 |
| i18n copy | 30-70 |
| Tests | 180-280 |
| Total | 550-910 |

Forecast: **high risk above the 400-line review budget**.

Recommended delivery strategy: split before apply unless tasks discover a much smaller route.

Suggested chained work units:

1. **Work Unit A — Auth session core**
   - Add types, gateway interface, session assembly service, provider/hook, and service/provider tests.
   - Keep UI changes minimal or none.
   - Target: ~300-420 changed lines.

2. **Work Unit B — Route/login/logout enforcement**
   - Replace login placeholder with MVP login form, enforce `ProtectedLayout`, add logout control, update i18n and routing tests.
   - Target: ~300-450 changed lines.

If Work Unit A exceeds 400 lines due to tests, it may still be acceptable with a documented review exception, but tasks should first look for a tighter split.

## Rollout Plan

1. Complete SDD tasks with the split decision recorded.
2. Apply Work Unit A using strict TDD:
   - RED service/provider tests;
   - GREEN auth session core;
   - REFACTOR boundaries and types.
3. Verify Work Unit A with `npm run test:run`, `npm run lint`, and `npm run build` if app code changes.
4. Apply Work Unit B using strict TDD:
   - RED route/login/logout tests;
   - GREEN route guard, login form, logout UI;
   - REFACTOR i18n and shell integration.
5. Verify Work Unit B with full validation.
6. Sync/archive OpenSpec after all accepted work units are complete.

## Rollback Plan

Repository rollback:

- revert `src/features/auth` additions;
- restore `AppProviders` to i18n-only;
- restore structural `ProtectedLayout` behavior if needed;
- restore `/login` placeholder route/page;
- remove login/logout i18n copy and tests.

Remote rollback:

- none expected. This design does not require remote InsForge auth configuration or schema changes.
- If apply unexpectedly touches remote auth settings, stop and document/approve rollback steps before proceeding.

## Open Questions for Tasks/Apply

These do not block design but must be resolved before or during apply:

1. Confirm exact profile query helper availability in installed SDK types (`maybeSingle` vs `single`) and use the smallest typed adapter implementation.
2. Decide whether unauthenticated protected routes redirect to `/login` or render a login-required component. Redirect is preferred.
3. Decide whether successful login returns to the originally requested path or always `/app/dashboard`. Preserving `from` is preferred if it stays small.
4. Decide whether topbar displays profile name/email or only logout. Logout-only is acceptable for scope control.
5. Confirm actual `profile_role` enum string values from the migration during implementation before hardcoding TypeScript unions.

## Acceptance Mapping

| Spec requirement | Design element |
| ---------------- | -------------- |
| InsForge Auth Boundary | `AuthSessionGateway` + InsForge adapter; no component SDK calls |
| Controlled Current Session Context | `AuthSessionProvider`, `useAuthSession`, discriminated `AuthSessionState` |
| Linked Profile Resolution | `findProfileByAuthUserId` and session assembly rules |
| Single Property Session Context | `AppSession.propertyId` from profile `property_id` |
| Protected Route Enforcement | `ProtectedLayout` state switch blocks non-authenticated shell rendering |
| Architecture Boundary Compliance | `features/auth` owns auth services/hooks; app layer owns route guard composition |
| Property Access Enforcement Deferral | Session exposes `propertyId`; issue #7 owns service/RLS enforcement |
| Auth Session TDD and Validation | Service/provider/route tests with `npm run test:run` and recorded RED/GREEN evidence |

## Skill Resolution

`none` — no parent-injected skill paths were available in this delegated runtime; design used the assigned SDD design role instructions and project files only.
