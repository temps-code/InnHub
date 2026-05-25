# Tasks — create-insforge-service-layer

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280-460 excluding OpenSpec planning artifacts |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR; split docs/evidence refinements only if code/tests exceed ~360 lines before docs or total approaches 400 lines |
| Delivery strategy | single-pr with checkpoint |
| Chain strategy | not-needed |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: not-needed
400-line budget risk: Medium

## Scope Guardrails

- Implement issue #9 only: shared service-layer foundation primitives, tests, optional concise architecture docs, and apply evidence.
- Keep the scope foundation-only; do not implement real CRUD services for properties, room types, rooms, guests, reservations, housekeeping, maintenance, billing, reports, dashboard, or any feature module.
- Do not add files under `src/features/**/services/*` in this issue.
- Do not add seed/demo data, UI screens/forms/tables, Storage, realtime, schema migrations, remote InsForge/PostgreSQL RLS or policies, RBAC, payment behavior, workflows, or broad architecture rewrites.
- Shared service helpers must not import React, JSX, `useAuthSession`, app shell/layout code, feature modules, or InsForge SDK internals.
- Raw backend/SDK errors, tokens, anon keys, JWTs, private keys, SQL payloads, and SDK objects must not be returned to UI-facing callers.
- If code/tests exceed ~360 changed lines before documentation, pause and ask whether to reduce scope or split docs/evidence into a second PR.

## Work Unit A — Service Result and Query Foundation

Goal: add typed, safe service result/error/query primitives that future feature services can reuse without live InsForge or feature CRUD.

Rollback boundary: remove `src/shared/services/serviceResult.ts` and `src/shared/services/serviceResult.test.ts` or the equivalent compact service-layer files, then revert Work Unit A evidence.

### A1. RED — Service result and safe error tests

- [x] Add failing tests in `src/shared/services/serviceResult.test.ts` before `src/shared/services/serviceResult.ts` exists, or use `src/shared/services/serviceLayer.test.ts` if implementation chooses a single compact file.
- [x] Cover:
  - `serviceSuccess(data)` returns `{ ok: true, data }`;
  - `serviceFailure(code)` returns `{ ok: false, error }` with a stable safe default message;
  - `serviceFailure(code, safeMessage)` accepts trusted local messages;
  - `normalizeServiceError(unknown)` does not expose raw `access_token`, `jwt`, `anon_key`, private key, SQL, or SDK payload text;
  - known local `ServiceError` values can be preserved only when they match the trusted local shape.
- [x] Run `npm run test:run -- src/shared/services/serviceResult.test.ts` or the chosen focused test command and record expected RED failure in `openspec/changes/create-insforge-service-layer/apply-progress.md` during apply.

### A2. GREEN — Service result helpers

- [x] Create `src/shared/services/serviceResult.ts` with:
  - `ServiceResult<T>`;
  - `ServiceErrorCode`;
  - `ServiceError`;
  - `serviceSuccess<T>()`;
  - `serviceFailure()`;
  - `normalizeServiceError()`.
- [x] Use safe default messages for `configuration-error`, `backend-error`, `validation-error`, `property-scope-error`, `not-found`, and `unknown-error`.
- [x] Do not expose `raw`, `cause`, arbitrary `error.message`, SDK objects, backend payloads, or secret values in returned errors.
- [x] Run the focused service-result tests and confirm GREEN.

### A3. RED — Query execution tests

- [x] Extend the focused test file with fake InsForge/PostgREST-style query responses.
- [x] Cover `executeServiceQuery()` cases:
  - `{ data, error: null }` maps to `serviceSuccess(data)`;
  - `{ data: null, error: null }` maps to safe `not-found` failure;
  - `{ data: null, error }` maps to safe `backend-error` failure;
  - thrown query/thenable errors map to safe `unknown-error` or the designed safe fallback;
  - raw backend/SDK message text containing secrets is not copied into the result.
- [x] Run the focused tests and record expected RED evidence.

### A4. GREEN — Query execution helper

- [x] Add `ServiceQueryResponse<T>`, `ServiceQuery<T>`, and `executeServiceQuery<T>()` to `src/shared/services/serviceResult.ts` or equivalent.
- [x] Keep the query contract local and structural; do not import `@insforge/sdk` or depend on live InsForge.
- [x] Support the designed `notFoundCode` option only if it keeps the helper small and tests clear.
- [x] Run focused service-result/query tests and confirm GREEN.

### A5. TRIANGULATE — Non-disclosure and boundary hardening

- [x] Add or strengthen tests proving normalized/query errors never include `access_token`, `jwt`, `anon_key`, `private_key`, raw SQL payloads, or arbitrary SDK objects.
- [x] Inspect helper files to confirm they have no React, JSX, auth hook, app shell, feature module, or SDK imports.
- [x] Run focused tests and confirm TRIANGULATE passes.

## Work Unit B — Service Context and Property-Scope Integration

Goal: add a small service context helper that composes issue #7 property-scope primitives without importing auth hooks or creating CRUD services.

Rollback boundary: remove `src/shared/services/serviceContext.ts` and `src/shared/services/serviceContext.test.ts` or the equivalent compact service-layer additions, then revert Work Unit B evidence.

### B1. RED — Service context tests

- [x] Add failing tests in `src/shared/services/serviceContext.test.ts`, or extend the compact service-layer test file if chosen.
- [x] Cover:
  - `{ propertyId: " property-1 " }` creates a service context with trimmed `propertyScope.propertyId`;
  - `null`, `undefined`, missing, and blank property IDs return safe `property-scope-error`;
  - `withServiceContext(session, operation)` does not run the operation when property scope is invalid;
  - `withServiceContext(session, operation)` passes `context.propertyScope` into the operation when valid;
  - operation results are preserved without converting success/failure shapes;
  - tests use fake operations only, not live InsForge and not feature CRUD services.
- [x] Run the focused service-context tests and record expected RED evidence.

### B2. GREEN — Service context helpers

- [x] Create `src/shared/services/serviceContext.ts` with:
  - `ServiceContext`;
  - `ServiceSessionLike`;
  - `PropertyScopedOperation<T>`;
  - `createServiceContext()`;
  - `withServiceContext()`.
- [x] Use `requirePropertyScope()` from `src/shared/services/propertyScope.ts` and map property-scope failures to safe `property-scope-error` `ServiceResult` failures.
- [x] Keep the helper structural; do not import `useAuthSession`, React, JSX, feature modules, app shell code, or InsForge SDK types.
- [x] Run focused service-context tests and confirm GREEN.

### B3. TRIANGULATE — Future-service pattern without CRUD

- [x] Add test-local fake operations or fake records only if needed to prove service context composition.
- [x] Confirm no files are added under `src/features/**/services/*`.
- [x] Confirm no properties, room-types, rooms, guests, or reservations CRUD behavior is introduced as an example.
- [x] Run focused service-result and service-context tests together.

### B4. REFACTOR — Exports and file shape

- [x] Decide whether to keep split files (`serviceResult.ts`, `serviceContext.ts`) or collapse into `serviceLayer.ts` only if it reduces complexity and preserves reviewability.
- [x] Keep exports narrow and predictable from concrete helper files; avoid adding a broad shared-service barrel unless it reduces import noise without hiding boundaries.
- [x] Run:
  - `npm run test:run -- src/shared/services/serviceResult.test.ts src/shared/services/serviceContext.test.ts` or equivalent focused command;
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [x] Record validation results and changed-line estimate in `openspec/changes/create-insforge-service-layer/apply-progress.md`.

## Work Unit C — Documentation and Apply Evidence

Goal: document the service-layer convention only if needed and record strict-TDD evidence without adding runtime feature behavior.

Start condition: Work Units A and B pass and code/tests remain reviewable. If code/tests exceed ~360 changed lines before docs, pause before editing docs and ask whether to split.

Rollback boundary: revert documentation edits in `docs/05-architecture.md` and `docs/05-architecture.es.md`, plus Work Unit C evidence.

### C1. Discovery — Documentation target check

- [x] Inspect `docs/05-architecture.md` and `docs/05-architecture.es.md` for existing service-layer guidance.
- [x] If current docs already explain the convention clearly enough, document the no-docs-change decision in `apply-progress.md` instead of editing docs.
- [x] If docs are changed, keep English and Spanish aligned in meaning and concise.

### C2. GREEN — Service-layer convention docs, if needed

- [x] Update `docs/05-architecture.md` with a concise `Service Layer Convention` or equivalent subsection stating:
  - components consume hooks/services, never InsForge SDK clients directly;
  - services return safe typed `ServiceResult<T>` style results;
  - services normalize backend errors before UI-facing callers see them;
  - property-owned services compose session-derived property-scope helpers;
  - repository/service helpers are distinct from remote database-level RLS or policies.
- [x] Mirror the same decision in `docs/05-architecture.es.md`.
- [x] Do not document feature CRUD, seed data, Storage, realtime, RLS/policies, or remote backend work as completed.

### C3. REFACTOR — Final scope review and evidence

- [x] Create or update `openspec/changes/create-insforge-service-layer/apply-progress.md` with:
  - RED/GREEN/TRIANGULATE/REFACTOR evidence;
  - validation commands and results;
  - changed-line count;
  - explicit foundation-only and no-CRUD boundary notes.
- [x] Inspect changed files and run targeted searches to confirm:
  - no `src/features/**/services/*` feature CRUD files;
  - no UI/app route/shell/component changes;
  - no database migrations;
  - no Storage, realtime, seed data, RBAC, remote policy/RLS, or schema changes;
  - no React/auth hook/SDK imports in shared service helpers.
- [x] Run final validation:
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`;
  - `git diff --check`.

## Budget Checkpoints

- [x] After Work Unit A, check changed lines excluding OpenSpec artifacts with a concrete command such as `git diff --stat src/shared/services docs/05-architecture.md docs/05-architecture.es.md`.
- [x] After Work Unit B, repeat the changed-line check before docs.
- [x] If code/tests exceed ~360 changed lines before documentation, pause and ask whether to split docs/evidence refinements or reduce scope.
- [x] If total implementation approaches or exceeds 400 changed lines, record the decision in `apply-progress.md` and use the approved auto-forecast strategy before opening a PR.

## Final SDD Closeout Tasks

- [ ] Review `openspec/changes/create-insforge-service-layer/proposal.md`, `specs/service-layer/spec.md`, `design.md`, and this `tasks.md` for consistency after apply.
- [ ] Ensure `openspec/changes/create-insforge-service-layer/apply-progress.md` records strict-TDD RED/GREEN/TRIANGULATE/REFACTOR evidence.
- [ ] Run final verification after implementation is accepted:
  - `npm run test:run`;
  - `npm run lint`;
  - `npm run build`.
- [ ] During verify, confirm acceptance criteria from `openspec/changes/create-insforge-service-layer/specs/service-layer/spec.md` and issue #9.
- [ ] Sync `service-layer` into canonical OpenSpec specs only after issue #9 verification passes.
- [ ] Archive `openspec/changes/create-insforge-service-layer/` only after sync and verification pass.

## PR / Delivery Notes

- Default recommendation: one PR to `qa` if implementation stays near or below the 400-line review budget.
- Split only if code/tests exceed ~360 lines before docs or the total implementation approaches/exceeds 400 lines.
- Keep GitHub issue comments in English for InnHub project artifacts.
- Do not close issue #9 until apply, verify, sync, and archive are complete and promoted through the agreed branch workflow.
