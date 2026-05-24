# Design — create-insforge-service-layer

## Change ID

`create-insforge-service-layer`

## Related Issue

- Issue #9: `feat(api): create InsForge service layer`

## Design Summary

Issue #9 creates InnHub's frontend service-layer foundation for future InsForge-backed feature services. The implementation should add small shared primitives for typed service results, safe error normalization, query execution, and property-scoped service contexts while preserving existing boundaries from auth/session and property-scoped access.

This design is foundation-only. It must not implement real CRUD services for properties, room types, rooms, guests, reservations, or any later MVP module. Later issues (#10-#15 and beyond) should use this foundation when they add feature-specific services.

## Source Inputs Consulted

- `openspec/changes/create-insforge-service-layer/proposal.md`
- `openspec/changes/create-insforge-service-layer/specs/service-layer/spec.md`
- `openspec/specs/backend-environment/spec.md`
- `openspec/specs/auth-session/spec.md`
- `openspec/specs/property-scoped-access/spec.md`
- `src/shared/services/insforgeClient.ts`
- `src/shared/services/propertyScope.ts`
- `src/features/auth/index.ts`
- `src/features/auth/types.ts`
- `docs/05-architecture.md`
- `AGENTS.md`

## Current State

The project already has:

- `src/shared/services/insforgeClient.ts`, the approved InsForge SDK client/config boundary;
- auth/session context from issue #5, including authenticated `AppSession.propertyId`;
- `src/shared/services/propertyScope.ts` from issue #7, including scope validation, query scoping, payload ownership, mutation target checks, and table registries;
- architecture documentation stating that components do not call InsForge directly and services own data access.

The remaining gap is a reusable service-layer convention. Future feature modules need a common way to return safe typed results, normalize SDK/backend failures, execute InsForge-style operations through testable adapters, and compose property-scope helpers without duplicating patterns.

## Key Design Decisions

| Area | Decision |
| ---- | -------- |
| Scope | Foundation only. Do not implement feature CRUD services in issue #9. |
| Location | Add compact shared helpers under `src/shared/services/`. Avoid feature folders. |
| Service result convention | Use a discriminated `ServiceResult<T>` with stable `ServiceError` codes. |
| Safe errors | Normalize unknown backend/SDK/config/scope errors into safe local codes/messages, never raw objects. |
| Query execution boundary | Use a small `executeServiceQuery()` helper over a promise/thenable returning `{ data, error }`. |
| Property scope integration | Define `ServiceContext` and helper creation from session-like input using issue #7 `requirePropertyScope()`. |
| InsForge SDK boundary | Keep SDK client creation in `insforgeClient.ts`; service-layer helpers accept query/client-like dependencies rather than importing SDK internals where possible. |
| Tests | Test local helpers with fake query/executor objects, not live InsForge or deep SDK mocks. |
| Documentation | Add concise architecture guidance only if current docs do not clearly name the service-layer result/query convention. |

## Proposed File Plan

Preferred compact shape:

```text
src/shared/services/
├── serviceResult.ts
├── serviceResult.test.ts
├── serviceContext.ts
└── serviceContext.test.ts
```

If implementation can stay clearer in fewer files, combine into:

```text
src/shared/services/serviceLayer.ts
src/shared/services/serviceLayer.test.ts
```

Use the split only when it improves reviewability:

- `serviceResult.ts`: result types, error codes, safe error mapping, query execution helper.
- `serviceContext.ts`: session-derived service context and property-scope integration.

Optional documentation updates:

```text
docs/05-architecture.md
docs/05-architecture.es.md
```

OpenSpec apply evidence later:

```text
openspec/changes/create-insforge-service-layer/apply-progress.md
```

Do not add:

```text
src/features/properties/services/*
src/features/room-types/services/*
src/features/rooms/services/*
src/features/guests/services/*
src/features/reservations/services/*
```

Those are owned by later feature issues.

## Data Contracts

### Service result

```ts
export type ServiceResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ServiceError };
```

For operations with no data, use `ServiceResult<void>` or a helper such as `serviceSuccess(undefined)`. Avoid a second empty-result convention unless implementation proves it improves readability.

### Service error

```ts
export type ServiceErrorCode =
  | "configuration-error"
  | "backend-error"
  | "validation-error"
  | "property-scope-error"
  | "not-found"
  | "unknown-error";

export type ServiceError = {
  readonly code: ServiceErrorCode;
  readonly message: string;
};
```

Rules:

1. `message` is safe for application/UI-facing callers.
2. No `raw`, `cause`, tokens, JWTs, anon keys, private keys, SQL payloads, or SDK objects are returned.
3. Logging raw errors is out of scope for issue #9. If later added, it must use an explicit safe logging boundary.

### Query response boundary

Use a small response contract that matches the shape of InsForge/PostgREST-style calls without importing SDK internals:

```ts
export type ServiceQueryResponse<T> = {
  readonly data: T | null;
  readonly error: unknown;
};

export type ServiceQuery<T> = Promise<ServiceQueryResponse<T>> | PromiseLike<ServiceQueryResponse<T>>;
```

Then:

```ts
export async function executeServiceQuery<T>(
  query: ServiceQuery<T>,
  options?: { readonly notFoundCode?: ServiceErrorCode },
): Promise<ServiceResult<T>>;
```

Default behavior:

1. `error` present -> `backend-error`.
2. `data === null` -> `not-found` unless caller explicitly accepts null through a separate helper or type.
3. data present -> `ok: true`.
4. thrown exceptions -> `unknown-error` or `configuration-error` if mapped explicitly.

Keep this helper generic. Do not make it know about rooms, guests, reservations, or any business table.

### Service context

```ts
export type ServiceContext = {
  readonly propertyScope: PropertyScope;
};

export type ServiceSessionLike = {
  readonly propertyId?: string | null;
};

export function createServiceContext(
  session: ServiceSessionLike | null | undefined,
): ServiceResult<ServiceContext>;
```

`createServiceContext()` should call `requirePropertyScope()` from issue #7 and map failures to `property-scope-error`.

Future feature hooks can do:

```ts
const { state } = useAuthSession();
if (state.status !== "authenticated") return ...;
const context = createServiceContext(state.session);
```

The shared service helper should remain structural and must not import `useAuthSession()` or React.

## Helper API Design

### Result helpers

```ts
export function serviceSuccess<T>(data: T): ServiceResult<T>;
export function serviceFailure(
  code: ServiceErrorCode,
  message?: string,
): ServiceResult<never>;
export function normalizeServiceError(error: unknown): ServiceError;
```

Suggested safe default messages:

| Code | Default message |
| ---- | --------------- |
| `configuration-error` | `Service configuration is unavailable.` |
| `backend-error` | `The service request could not be completed.` |
| `validation-error` | `The service request is invalid.` |
| `property-scope-error` | `A valid property scope is required.` |
| `not-found` | `The requested record was not found.` |
| `unknown-error` | `An unexpected service error occurred.` |

`normalizeServiceError()` should detect local `ServiceError` objects if needed, but it must not copy arbitrary `error.message` into the returned message unless the message is from a trusted local code. This avoids repeating the login-message leak fixed in issue #5.

### Property-scoped operation pattern

Issue #9 should not implement a real service, but it can define a generic contract future services can follow:

```ts
export type PropertyScopedOperation<T> = (
  context: ServiceContext,
) => Promise<ServiceResult<T>>;
```

Optional helper:

```ts
export async function withServiceContext<T>(
  session: ServiceSessionLike | null | undefined,
  operation: PropertyScopedOperation<T>,
): Promise<ServiceResult<T>>;
```

Behavior:

1. build service context from session;
2. return `property-scope-error` if missing/invalid;
3. execute operation with `context.propertyScope`;
4. preserve operation result.

This proves the pattern without creating feature CRUD.

## Example Usage for Later Issues (Documentation Only)

A future `roomTypesService` in issue #11 might:

```ts
const context = createServiceContext(session);
if (!context.ok) return context;

const query = scopeOperationalQuery(
  client.database.from("room_types").select("..."),
  context.data.propertyScope,
);

return executeServiceQuery(query);
```

This example is illustrative only. Issue #9 must not add `roomTypesService`.

## Testing Strategy

Strict TDD applies.

### Service result tests

Target: `src/shared/services/serviceResult.test.ts` or combined service-layer test.

Cover:

- `serviceSuccess()` returns `ok: true` with typed data;
- `serviceFailure()` returns stable safe local code/message;
- `normalizeServiceError()` does not expose raw SDK error messages containing `access_token`, `jwt`, `anon_key`, or private payloads;
- `executeServiceQuery()` maps success data to success;
- `executeServiceQuery()` maps backend `error` to safe failure;
- `executeServiceQuery()` maps `data: null` to `not-found`;
- thrown query errors become safe failures.

### Service context tests

Target: `src/shared/services/serviceContext.test.ts` or combined service-layer test.

Cover:

- authenticated/session-like `{ propertyId: " property-1 " }` creates context with trimmed `propertyScope`;
- missing/blank property scope maps to `property-scope-error`;
- `withServiceContext()` does not run the operation when scope is missing;
- `withServiceContext()` passes `propertyScope` into the operation when valid;
- tests use fake operations, not live InsForge.

### Boundary checks

During verify/review:

- grep changed files for disallowed feature CRUD names if useful;
- confirm shared helpers do not import React, JSX, `useAuthSession`, or feature modules;
- confirm no new `src/features/*/services` CRUD implementation exists.

## Architecture Documentation Plan

`docs/05-architecture.md` already states:

- components do not call InsForge directly;
- feature services own data access;
- property-scoped data access uses session-derived scope and helpers.

Issue #9 may add a short `Service Layer Convention` subsection if apply shows the result/error/query convention needs to be discoverable outside OpenSpec. Keep it concise and mirror the same meaning in `docs/05-architecture.es.md`.

Suggested content:

- services return `ServiceResult<T>` or equivalent safe typed results;
- services normalize backend errors before UI-facing callers see them;
- services compose property-scope helpers for property-owned tables;
- components consume hooks/services, never SDK clients.

Do not add diagrams or broad architecture rewrites.

## Tradeoffs

| Option | Pros | Cons | Decision |
| ------ | ---- | ---- | -------- |
| Single `serviceLayer.ts` file | Small file count, easier initial import path | Can become dense if result/context/execution grow | Acceptable if implementation remains compact |
| Split `serviceResult.ts` and `serviceContext.ts` | Clearer responsibilities, easier focused tests | Slightly more files/exports | Preferred if line count remains reasonable |
| Implement first real CRUD service now | Validates pattern with a concrete table | Invades #10/#11/#12/#13 and increases review size | Rejected for issue #9 |
| Full repository framework/ORM | Consistent abstraction across all features | Overbuilt for MVP, hides InsForge behavior, high review cost | Rejected |
| Copy raw SDK messages into service errors | More diagnostic detail | Risks leaking secrets/backend internals to UI | Rejected |
| Service helpers import auth hook directly | Convenient for components | Couples shared services to React/auth feature and hurts tests | Rejected |

## Affected Files Forecast

Likely implementation files:

```text
src/shared/services/serviceResult.ts
src/shared/services/serviceResult.test.ts
src/shared/services/serviceContext.ts
src/shared/services/serviceContext.test.ts
openspec/changes/create-insforge-service-layer/apply-progress.md
```

Optional docs if needed:

```text
docs/05-architecture.md
docs/05-architecture.es.md
```

Avoided files:

```text
src/features/**/services/*
database/migrations/*
src/app/**
src/shared/components/**
```

## Review Workload Forecast

| Area | Estimated changed lines |
| ---- | -----------------------: |
| Service result helpers | 70-110 |
| Service context helpers | 50-80 |
| Tests | 140-220 |
| Architecture docs, if needed | 20-50 |
| Apply evidence | 60-100 |

Estimated implementation excluding OpenSpec planning artifacts: **280-460 changed lines**.

Risk: **medium** under the 400-line budget.

Recommendation:

- keep one PR if helpers/tests/docs stay near or below 400 changed lines;
- if code/tests alone exceed ~360 lines before docs, pause and split docs/evidence refinements into a second PR or reduce helper scope;
- do not add feature CRUD to justify the foundation.

## Rollout Plan for Apply

1. RED: add service result/error/query tests.
2. GREEN: implement service result helpers and query execution helper.
3. TRIANGULATE: add safe-error non-disclosure cases.
4. RED: add service context/property-scope integration tests.
5. GREEN: implement service context helpers using `requirePropertyScope()`.
6. REFACTOR: keep exports narrow and avoid framework creep.
7. Documentation: update architecture docs only if needed.
8. Validation: run focused tests, `npm run test:run`, `npm run lint`, and `npm run build`.
9. Evidence: record strict-TDD cycles, validation, scope boundary, and changed-line estimate.

## Rollback

Rollback is low risk if implementation stays foundation-only:

- remove shared service-layer helper files and tests;
- revert optional architecture documentation updates;
- remove `apply-progress.md` evidence for the change.

No database rollback, remote InsForge cleanup, seed-data cleanup, Storage cleanup, or UI rollback should be needed.

## Open Questions for Tasks

- Should implementation use two helper files (`serviceResult.ts`, `serviceContext.ts`) or one compact `serviceLayer.ts` based on line count?
- Should docs be updated in this issue, or are the existing architecture plus OpenSpec artifacts enough?
- What exact changed-line checkpoint should tasks use before splitting? Suggested: pause if code/tests exceed ~360 lines before docs.

## Acceptance Mapping

| Spec acceptance | Design coverage |
| --------------- | --------------- |
| Shared safe results | `ServiceResult<T>`, `ServiceError`, result helpers |
| No raw SDK/backend leaks | `normalizeServiceError()` and tests for token/JWT/anon-key non-disclosure |
| InsForge isolation | Helpers accept query/client-like boundaries; no JSX or SDK calls from components |
| Property-scope context | `createServiceContext()` and `withServiceContext()` use `requirePropertyScope()` |
| Testable query boundary | `executeServiceQuery()` with fake query responses |
| Feature service preparation | documented future pattern, no CRUD files |
| Component boundary docs | optional concise architecture update |
| Strict TDD | RED/GREEN cycles planned for result and context helpers |

## Next Step

Proceed to SDD tasks for `create-insforge-service-layer`. Do not implement code until tasks are reviewed/approved or the parent grants apply permission.
