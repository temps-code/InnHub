# Design — enforce-property-scoped-access

## Change ID

`enforce-property-scoped-access`

## Related Issue

- Issue #7: `feat(security): enforce property-scoped data access`

## Design Summary

Issue #7 establishes the property-scoped data-access contract that future InnHub services must use before feature CRUD work grows. The implementation should add small, testable shared service utilities that derive a validated property scope from the authenticated app session, apply that scope to operational queries, and reject missing or mismatched property ownership before data access is built.

This design intentionally does **not** create full CRUD services for properties, rooms, guests, reservations, or operations. It also does not add seed data or Storage. Issue #9 can build broader feature service abstractions on top of the scoped-access primitives created here.

## Source Inputs Consulted

- `openspec/changes/enforce-property-scoped-access/proposal.md`
- `openspec/changes/enforce-property-scoped-access/specs/property-scoped-access/spec.md`
- `openspec/specs/auth-session/spec.md`
- `openspec/specs/database-schema/spec.md`
- `docs/05-architecture.md`
- `docs/07-functional-specification.md`
- `AGENTS.md`
- `src/features/auth/**`
- `src/shared/services/insforgeClient.ts`
- `database/migrations/001_define_core_innhub_schema.sql`

## Current State

The project already has the required prerequisites:

- issue #5 provides an authenticated `AppSession` with exactly one `propertyId`;
- issue #6 provides `property_id` on property-owned operational tables and composite relationship constraints for many cross-property references;
- `src/shared/services/insforgeClient.ts` centralizes InsForge client creation;
- architecture rules already prohibit JSX components from calling InsForge directly.

The gap is that future feature services do not yet have a shared, testable pattern for applying `property_id` to reads, writes, and mutations. Without that pattern, each module could invent ad hoc filters or accidentally trust a property ID from UI input.

## Key Design Decisions

| Area | Decision |
| ---- | -------- |
| Primary enforcement in this issue | Implement repository-level service/query enforcement primitives in the frontend codebase. |
| Remote database policies | Do not apply remote InsForge/PostgreSQL RLS/policy changes in the default issue #7 implementation. Document the limitation and design a discovery gate for a later remote-policy slice. |
| Source of property scope | Use authenticated session data only. Components, routes, forms, URLs, and payloads are not authoritative property sources. |
| Location | Put reusable primitives under `src/shared/services/propertyScope.ts` and related tests under `src/shared/services/propertyScope.test.ts` or a focused `__tests__` folder. |
| Dependency direction | Shared utilities must not import React, hooks, JSX, app shell code, or feature services. They may accept structural session-like objects so callers can pass `AuthSessionState` or `AppSession` without making shared code depend on auth feature internals. |
| Query helper style | Use small functions that apply `.eq("property_id", propertyId)` or `.eq("id", propertyId)` to a query-like object. Avoid a large repository framework. |
| Writes | Provide helper functions that inject the current `propertyId` into property-owned payloads and reject caller payloads that include a different `property_id`. |
| Mutations | Provide helper functions that constrain update/delete/select-by-id operations with the current `propertyId`. |
| Table coverage | Define a typed registry of property-owned operational tables from the canonical schema. Treat `properties` as a scoped root whose allowed identity is `session.propertyId`. |
| Documentation | Update the smallest architecture documentation section, in English and Spanish, to state that service queries must consume the session-derived property scope. |

## Remote Policy Boundary Decision

Complete backend-level isolation would require validated InsForge/PostgreSQL policies that bind the authenticated auth user to `profiles.auth_user_id` and then to `profiles.property_id`. This is the strongest long-term security layer, but it depends on InsForge's supported SQL auth context and policy mechanics.

For issue #7, the default implementation should **not** claim complete database-level isolation. It should deliver the repository/service boundary required before issue #9 and CRUD work, and it should record the remaining backend-policy requirement explicitly.

Remote policy work should be deferred unless all of the following are true during a future approved slice:

1. current InsForge documentation or MCP confirms the supported SQL auth identity helper or JWT claim access;
2. policies can be represented as versioned SQL in the repository;
3. validation can prove cross-property denial remotely;
4. rollback SQL and remote rollback steps are documented;
5. the user approves remote policy application.

This avoids silently creating fragile or unverified RLS assumptions while still preventing future frontend/service code from bypassing property scope.

## Proposed File Plan

```text
src/
└── shared/
    └── services/
        ├── propertyScope.ts
        └── propertyScope.test.ts

docs/
├── 05-architecture.md
└── 05-architecture.es.md

openspec/
└── changes/
    └── enforce-property-scoped-access/
        ├── apply-progress.md       # later apply phase only
        ├── design.md               # this file
        ├── proposal.md
        ├── specs/property-scoped-access/spec.md
        └── tasks.md                # next phase
```

If implementation discovers that `propertyScope.ts` becomes too dense, split into:

```text
src/shared/services/propertyScope.ts
src/shared/services/propertyScopedQuery.ts
src/shared/services/propertyScopedTables.ts
```

Keep the split small. Do not create an ORM, generic repository framework, or feature CRUD services in this issue.

## Data Contracts

### Property scope

```ts
export type PropertyScope = {
  readonly propertyId: string;
};
```

A property scope is valid only when `propertyId.trim()` is non-empty.

### Safe results

Use safe local errors that do not expose raw backend payloads:

```ts
export type PropertyScopeErrorCode =
  | "missing-property-scope"
  | "property-scope-mismatch"
  | "unsupported-property-table";

export type PropertyScopeResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly code: PropertyScopeErrorCode };
```

### Session-like input

Shared code should avoid importing `src/features/auth` types. Use structural input instead:

```ts
export type PropertyScopedSessionLike = {
  readonly propertyId?: string | null;
};
```

`requirePropertyScope(sessionLike)` converts this into a `PropertyScopeResult<PropertyScope>`.

Future feature hooks/services can pass `authSession.state.session` when `state.status === "authenticated"`.

## Operational Table Registry

Define the known property-owned table set from `openspec/specs/database-schema/spec.md`:

```ts
export const PROPERTY_OWNED_TABLES = [
  "profiles",
  "guests",
  "room_types",
  "rooms",
  "reservations",
  "reservation_items",
  "stays",
  "stay_guests",
  "housekeeping_tasks",
  "maintenance_tickets",
  "invoices",
  "payments",
] as const;
```

`properties` is a scoped root, not a `property_id`-owned table. Access to the current property should be constrained by `id = scope.propertyId`.

```ts
export const PROPERTY_ROOT_TABLES = ["properties"] as const;
```

## Helper API Design

### Scope validation

```ts
export function requirePropertyScope(
  session: PropertyScopedSessionLike | null | undefined,
): PropertyScopeResult<PropertyScope>;
```

Rules:

1. `null`, `undefined`, missing `propertyId`, and blank `propertyId` return `missing-property-scope`.
2. Valid IDs are trimmed and returned as `{ propertyId }`.
3. The helper does not call auth hooks, InsForge, or browser APIs.

### Query-like boundary

Use a minimal query-like interface so tests can fake the SDK without depending on InsForge internals:

```ts
export type EqQuery<TQuery> = {
  readonly eq: (column: string, value: string) => TQuery;
};

export function scopeOperationalQuery<TQuery extends EqQuery<TQuery>>(
  query: TQuery,
  scope: PropertyScope,
): TQuery;

export function scopeCurrentPropertyQuery<TQuery extends EqQuery<TQuery>>(
  query: TQuery,
  scope: PropertyScope,
): TQuery;
```

- `scopeOperationalQuery()` applies `.eq("property_id", scope.propertyId)`.
- `scopeCurrentPropertyQuery()` applies `.eq("id", scope.propertyId)` for the `properties` root.

### Payload ownership helpers

```ts
export type PropertyOwnedPayload = {
  readonly property_id?: string;
};

export function assignPropertyOwnership<TPayload extends PropertyOwnedPayload>(
  payload: TPayload,
  scope: PropertyScope,
): PropertyScopeResult<Omit<TPayload, "property_id"> & { readonly property_id: string }>;
```

Rules:

1. If payload has no `property_id`, inject `scope.propertyId`.
2. If payload has the same `property_id`, normalize/keep it.
3. If payload has a different non-blank `property_id`, return `property-scope-mismatch`.
4. Never accept UI payload `property_id` as authority over the session scope.

### Mutation target helper

```ts
export function assertSameProperty(
  candidatePropertyId: string | null | undefined,
  scope: PropertyScope,
): PropertyScopeResult<PropertyScope>;
```

This pure helper supports feature services that load or receive a target record's property before mutating a relationship. It blocks known mismatches before a service reports success.

## Adapter Pattern for Future Services

Issue #7 should provide primitives, not full feature services. Future issue #9 can wrap them in feature-specific services. Example pattern for later work:

```ts
export async function listRooms(context: ServiceContext) {
  const scope = requirePropertyScope(context.session);
  if (!scope.ok) return scope;

  const query = scopeOperationalQuery(
    context.client.database.from("rooms").select("id, identifier, state"),
    scope.value,
  );

  return query;
}
```

The important contract is that feature services receive a service context containing a session-derived property scope. JSX components should call feature hooks or services; they should not pass arbitrary property IDs or create InsForge clients.

## Cross-Property Prevention Strategy

| Case | Issue #7 handling |
| ---- | ----------------- |
| Missing session property | Block before query/payload construction. |
| Read operational table | Apply `property_id = session.propertyId`. |
| Read current property | Apply `id = session.propertyId`. |
| Create operational record | Inject `property_id = session.propertyId`; reject mismatched payload property. |
| Update/delete operational record | Apply `property_id = session.propertyId` to the mutation query. |
| Known target record belongs to another property | `assertSameProperty()` rejects the operation. |
| Relationship across two property-owned records | Provide helper contract; full relationship validation belongs to feature services and existing database composite FKs. |
| Malicious direct backend call bypassing frontend helpers | Not fully solved by repository helpers; document as remote policy follow-up unless remote policies are implemented and validated. |

## Documentation Design

Update `docs/05-architecture.md` and `docs/05-architecture.es.md` only if apply includes code. Add a compact rule under layer rules or backend/service guidance:

- service data access must derive property scope from the authenticated app session;
- operational queries must use the shared property-scoping helper or document a justified exception;
- components must not pass arbitrary property IDs as the current property authority.

Because `docs/05-architecture.md` is a numbered bilingual doc, update the Spanish pair in the same work unit.

No seed data documentation is needed. No Storage documentation is needed.

## Test Strategy

Use strict TDD with focused unit tests before implementation.

### Unit tests

Target: `src/shared/services/propertyScope.test.ts`

Cover:

- `requirePropertyScope()` returns valid trimmed scope from a session-like object;
- missing, undefined, null, and blank property values return `missing-property-scope`;
- `scopeOperationalQuery()` applies exactly one `property_id` equality filter to a fake query builder;
- `scopeCurrentPropertyQuery()` applies `id = propertyId` for the `properties` root;
- `assignPropertyOwnership()` injects session `propertyId` when payload lacks one;
- `assignPropertyOwnership()` allows matching `property_id`;
- `assignPropertyOwnership()` rejects mismatched `property_id`;
- `assertSameProperty()` accepts matching target property and rejects mismatches;
- errors/results do not include raw token, anon key, JWT, or backend payload values.

### Contract/coverage tests

Also test that `PROPERTY_OWNED_TABLES` contains the canonical property-owned set:

- `profiles`;
- `guests`;
- `room_types`;
- `rooms`;
- `reservations`;
- `reservation_items`;
- `stays`;
- `stay_guests`;
- `housekeeping_tasks`;
- `maintenance_tickets`;
- `invoices`;
- `payments`.

This keeps table coverage visible before feature services are added.

### Validation commands

During apply/verify:

```bash
npm run test:run -- src/shared/services/propertyScope.test.ts
npm run test:run
npm run lint
npm run build
```

`npm run build` is required because this change adds TypeScript service contracts used by future runtime code.

## Review Workload Forecast

| Area | Estimated changed lines |
| ---- | -----------------------: |
| Shared property-scope utilities | 120-190 |
| Unit/contract tests | 160-240 |
| Architecture docs EN/ES | 20-50 |
| OpenSpec apply evidence | 40-80 |
| Total excluding OpenSpec planning artifacts | 300-480 |

Risk: **medium**.

The implementation may fit one PR if the helper stays compact. If tests or docs push the implementation over the 400-line budget, split before apply:

- Work Unit A: shared property-scope utilities and tests;
- Work Unit B: architecture documentation and any additional service-context/contract refinements.

Do not include remote SQL policies in the same PR unless separately approved, because that would likely push the review into high-risk territory and require remote validation/rollback evidence.

## Rollout Plan

1. Add failing property-scope tests first.
2. Implement `PropertyScope` types, result helpers, table registry, and pure validation utilities.
3. Implement query/payload/mutation helper functions against query-like interfaces.
4. Add/adjust tests until focused property-scope tests pass.
5. Add concise architecture documentation in English and Spanish if code is added.
6. Run full validation.
7. Record RED/GREEN/REFACTOR evidence in `apply-progress.md`.
8. Open PR to `qa` for issue #7 after review.

## Rollback Plan

Repository rollback is straightforward:

- remove property-scope helper files and tests;
- revert architecture documentation updates;
- revert OpenSpec apply evidence for the change.

No database migration rollback, seed cleanup, Storage cleanup, or remote InsForge rollback should be needed because remote policy changes are not part of the default design.

If a future approved slice adds remote policies, that slice must include explicit down SQL or rollback steps and validation evidence.

## Tradeoffs

| Option | Pros | Cons | Decision |
| ------ | ---- | ---- | -------- |
| Frontend/service helper only | Small, testable, unblocks #9 and CRUD service design. | Not complete backend isolation if someone bypasses the frontend. | Use for issue #7 default implementation and document remote gap. |
| Full remote RLS/policies now | Strongest security boundary. | Requires confirmed InsForge auth SQL support, remote execution, rollback, and broader review. | Defer unless separately confirmed and approved. |
| Large generic repository framework | Centralizes many access patterns. | Overengineering before feature services exist; likely exceeds budget. | Reject. |
| Feature-specific service examples in #7 | Shows real usage. | Can drift into #10-#14 CRUD scope. | Avoid except for tiny contract examples in tests if needed. |
| Shared utilities importing auth types | Strong type coupling to current session implementation. | Shared layer would depend on feature layer. | Avoid; use structural session-like input. |

## No Seed Data or Storage Needed

Issue #7 does not need seed data because the core behavior is a service/query contract that can be tested with fake sessions, fake query builders, and representative payloads. Seed/demo records remain issue #8.

Issue #7 does not need InsForge Storage because no files, uploads, attachments, or file metadata are involved. Storage remains deferred until a concrete file workflow requires it.

## Open Questions for Tasks / Apply

- Should architecture documentation updates be included in the first PR if the implementation is near the 400-line budget, or split into a small follow-up docs PR?
- During apply, should we add a short remote-policy follow-up note to issue #7 evidence only, or create a separate future issue for remote InsForge/PostgreSQL policy enforcement after confirming InsForge support?

Neither question blocks planning. Tasks should forecast and choose the smallest reviewable path before implementation.

## SDD Result Contract

- `status`: `completed`
- `artifact`: `openspec/changes/enforce-property-scoped-access/design.md`
- `scope`: design only, no application code edited
- `skill_resolution`: `none`
- `memory`: unavailable in this subagent runtime; no Engram save performed
