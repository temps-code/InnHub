# Tasks — enforce-property-scoped-access

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300-480 excluding OpenSpec planning artifacts |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR; split to PR 1 utilities/tests → PR 2 docs/refinements only if implementation crosses 400 changed lines |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Scope Guardrails

- Implement issue #7 only: repository/service-level property-scoping primitives, tests, and concise documentation of the central rule.
- Property scope must come from authenticated session `propertyId`/`property_id`, not UI, form, route, URL, or arbitrary caller input.
- Keep issue #9 service layer out of scope except defining reusable contracts future services can consume.
- Keep issue #8 seed/demo data out of scope.
- Do not implement feature CRUD for properties, room types, rooms, guests, reservations, housekeeping, maintenance, billing, reports, or dashboard.
- Do not add InsForge Storage, uploads, file metadata, realtime subscriptions, RBAC, payment behavior, schema migrations, or broad UI changes.
- Do not apply remote InsForge/PostgreSQL RLS or policies in this change unless the owner explicitly approves a separate remote-policy slice before apply.
- Components must not create InsForge clients or call InsForge database APIs directly.

## Work Unit A — Property-Scope Primitives and Tests

Goal: add compact, pure/testable property-scope utilities under `src/shared/services` that future services can reuse.

Rollback boundary: remove `src/shared/services/propertyScope.ts` and `src/shared/services/propertyScope.test.ts`, then revert apply evidence for Work Unit A.

### A1. RED — Property scope validation tests

- [x] Add failing tests in `src/shared/services/propertyScope.test.ts` before `src/shared/services/propertyScope.ts` exists.
- [x] Cover `requirePropertyScope()` cases from `openspec/changes/enforce-property-scoped-access/specs/property-scoped-access/spec.md`:
  - valid session-like `{ propertyId: " property-1 " }` returns trimmed `property-1`;
  - `null`, `undefined`, missing `propertyId`, and blank `propertyId` return `missing-property-scope`;
  - results do not expose token, anon key, JWT, or raw backend payload values.
- [x] Run `npm run test:run -- src/shared/services/propertyScope.test.ts` and record expected RED failure in `openspec/changes/enforce-property-scoped-access/apply-progress.md` during apply.

### A2. GREEN — Scope types and validation helper

- [x] Create `src/shared/services/propertyScope.ts` with:
  - `PropertyScope`;
  - `PropertyScopedSessionLike`;
  - `PropertyScopeErrorCode`;
  - `PropertyScopeResult<T>`;
  - `requirePropertyScope(session)`.
- [x] Keep this file free of React, JSX, app shell, feature service, auth hook, and InsForge SDK imports.
- [x] Run `npm run test:run -- src/shared/services/propertyScope.test.ts` and confirm validation tests pass.

### A3. RED — Query and current-property scoping tests

- [x] Extend `src/shared/services/propertyScope.test.ts` with a fake query-like object that records `.eq(column, value)` calls.
- [x] Add failing tests for:
  - `scopeOperationalQuery(query, scope)` applies exactly `property_id = scope.propertyId`;
  - `scopeCurrentPropertyQuery(query, scope)` applies exactly `id = scope.propertyId` for the `properties` root;
  - helpers return the query object so future service chains can continue.
- [x] Run focused property-scope tests and record expected RED evidence.

### A4. GREEN — Query scoping helpers

- [x] Add a minimal `EqQuery<TQuery>` interface to `src/shared/services/propertyScope.ts`.
- [x] Implement `scopeOperationalQuery<TQuery>()` and `scopeCurrentPropertyQuery<TQuery>()`.
- [x] Avoid depending on InsForge SDK internals; test against the fake query boundary.
- [x] Run focused property-scope tests and confirm GREEN.

### A5. RED — Payload ownership and mismatch tests

- [x] Extend `src/shared/services/propertyScope.test.ts` with failing tests for `assignPropertyOwnership()`:
  - payload without `property_id` gets session `propertyId` injected;
  - payload with matching `property_id` is accepted and normalized;
  - payload with different non-blank `property_id` returns `property-scope-mismatch`;
  - caller-supplied property ID is never treated as authoritative over session scope.
- [x] Add failing tests for `assertSameProperty()`:
  - matching target property is accepted;
  - missing/blank target property returns `missing-property-scope` or a documented safe code;
  - mismatched target property returns `property-scope-mismatch`.
- [x] Run focused tests and record expected RED evidence.

### A6. GREEN — Payload and mutation helpers

- [x] Implement `PropertyOwnedPayload`, `assignPropertyOwnership()`, and `assertSameProperty()` in `src/shared/services/propertyScope.ts`.
- [x] Ensure returned errors are stable local codes only and never include raw payloads, SDK errors, tokens, anon keys, or JWTs.
- [x] Run focused property-scope tests and confirm GREEN.

### A7. TRIANGULATE — Operational table registry coverage

- [x] Add `PROPERTY_OWNED_TABLES` to `src/shared/services/propertyScope.ts` with the canonical set from `openspec/specs/database-schema/spec.md`:
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
- [x] Add `PROPERTY_ROOT_TABLES` with `properties` only.
- [x] Add tests proving the registry contains the expected property-owned tables and treats `properties` as a scoped root.
- [x] Do not create feature CRUD services while adding registry coverage.
- [x] Run focused tests and confirm TRIANGULATE passes.

### A8. REFACTOR — Utility boundary cleanup

- [x] Review `src/shared/services/propertyScope.ts` for small API shape, stable naming, and no framework/ORM creep.
- [x] If the file becomes too dense, split only into concrete small files under `src/shared/services/` such as `propertyScopedTables.ts`; keep exports reviewable.
- [x] Run:
  - `npm run test:run -- src/shared/services/propertyScope.test.ts`;
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [x] Record validation results and changed-line estimate in `openspec/changes/enforce-property-scoped-access/apply-progress.md`.

## Work Unit B — Architecture Documentation and Evidence

Goal: document the central property-scoping rule and record repository-vs-remote-policy boundaries without adding runtime feature behavior.

Start condition: Work Unit A utilities/tests pass and current changed-line count is still reviewable. If Work Unit A already exceeds 400 changed lines, pause before adding docs and ask whether to split.

Rollback boundary: revert documentation changes in `docs/05-architecture.md` and `docs/05-architecture.es.md`, plus Work Unit B evidence in `apply-progress.md`.

### B1. RED/Discovery — Documentation target check

- [x] Inspect `docs/05-architecture.md` and `docs/05-architecture.es.md` for the smallest section to add service-layer property scoping guidance.
- [x] Confirm no existing text already states the issue #7 rule clearly enough; if it does, document that no docs change is needed in `apply-progress.md`.
- [x] If docs are changed, keep English and Spanish meaning aligned.

### B2. GREEN — Architecture rule documentation

- [x] Update `docs/05-architecture.md` with a concise rule that:
  - service data access derives property scope from authenticated session context;
  - operational queries must use shared property-scoping helpers or document an exception;
  - components must not pass arbitrary property IDs as current-property authority;
  - repository helpers do not equal complete database/RLS isolation.
- [x] Mirror the same decision in `docs/05-architecture.es.md`.
- [x] Do not document seed data, Storage, feature CRUD, or remote policies as completed.

### B3. TRIANGULATE — Remote policy follow-up evidence

- [x] Add a short section to `openspec/changes/enforce-property-scoped-access/apply-progress.md` documenting that remote InsForge/PostgreSQL policy enforcement is not applied in issue #7.
- [x] State the future gate conditions from `openspec/changes/enforce-property-scoped-access/design.md`:
  - confirm supported InsForge SQL auth/JWT identity helper;
  - represent policies as versioned SQL;
  - validate remote cross-property denial;
  - document rollback;
  - get owner approval before remote application.
- [x] Do not create a new GitHub issue unless the owner explicitly asks during or after apply.

### B4. REFACTOR — Final scope review and validation

- [x] Inspect changed files to confirm there is no feature CRUD, seed data, Storage, realtime, RBAC, schema migration, remote policy execution, broad UI work, or direct InsForge calls from JSX.
- [x] Run final validation:
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [x] Run `git diff --check`.
- [x] Record final validation, changed-line count, and any split decision in `openspec/changes/enforce-property-scoped-access/apply-progress.md`.

## Budget Checkpoints

- [x] After Work Unit A, check changed lines excluding OpenSpec planning artifacts with a concrete command such as `git diff --stat src/shared/services docs/05-architecture.md docs/05-architecture.es.md`.
- [x] If implementation approaches or exceeds 400 changed lines before documentation, pause and ask whether to split Work Unit B into a separate PR.
- [x] If remote policy work becomes necessary, stop and request approval before adding SQL, remote InsForge changes, or rollback artifacts.

## Final SDD Closeout Tasks

- [ ] Review `openspec/changes/enforce-property-scoped-access/proposal.md`, `specs/property-scoped-access/spec.md`, `design.md`, and this `tasks.md` for consistency after apply.
- [ ] Ensure `openspec/changes/enforce-property-scoped-access/apply-progress.md` records strict-TDD RED/GREEN/TRIANGULATE/REFACTOR evidence.
- [ ] Run final verification after implementation is accepted:
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [ ] During verify, confirm acceptance criteria from `openspec/changes/enforce-property-scoped-access/specs/property-scoped-access/spec.md` and issue #7.
- [ ] Sync `property-scoped-access` into canonical OpenSpec specs only after issue #7 verification passes.
- [ ] Archive `openspec/changes/enforce-property-scoped-access/` only after sync and verification pass.

## PR / Delivery Notes

- Default recommendation: one PR to `qa` if implementation stays at or below the 400-line review budget.
- If changed lines exceed 400, split into:
  - PR 1: property-scope utilities and tests;
  - PR 2: architecture documentation and evidence refinements.
- Keep GitHub issue comments in English for InnHub project artifacts.
- Do not close issue #7 until apply, verify, sync, and archive are complete and promoted through the agreed branch workflow.
