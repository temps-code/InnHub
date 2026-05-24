# Apply Progress — enforce-property-scoped-access

## Workload / PR Boundary

| Field | Value |
| ----- | ----- |
| Current boundary | Single PR — property-scope primitives, tests, docs, and evidence |
| Delivery strategy | Single PR, per tasks forecast |
| 400-line budget risk | Medium |
| Split decision | No split needed; Work Unit A remained comfortably below 400 changed lines before docs |
| Changed-line estimate excluding OpenSpec planning artifacts | ~266 lines across property-scope code/tests and architecture docs |

Work Unit A stayed reviewable before documentation was added: `propertyScope.ts` and `propertyScope.test.ts` total 249 lines, and architecture docs added 16 lines. No feature CRUD, service-layer implementation, remote policy work, or schema changes were added.

## Completed Tasks

- A1 RED property scope validation tests.
- A2 GREEN scope types and validation helper.
- A3 RED query/current-property scoping tests.
- A4 GREEN query scoping helpers.
- A5 RED payload ownership and mutation target tests.
- A6 GREEN payload and mutation helpers.
- A7 TRIANGULATE operational table registry coverage.
- A8 REFACTOR utility boundary cleanup and validation.
- B1 documentation target discovery.
- B2 architecture rule documentation in English and Spanish.
- B3 remote policy follow-up evidence.
- B4 final scope review and validation.

## Files Changed

| File | Change |
| ---- | ------ |
| `src/shared/services/propertyScope.ts` | Added pure property-scope contracts, query helpers, payload ownership helpers, mutation property assertions, and table registries. |
| `src/shared/services/propertyScope.test.ts` | Added strict-TDD coverage for missing scope, query scoping, payload mismatch prevention, mutation target checks, safe errors, and table registry coverage. |
| `docs/05-architecture.md` | Documented the service-layer property-scoping rule and repository-vs-remote-policy boundary. |
| `docs/05-architecture.es.md` | Mirrored the architecture guidance in Spanish. |
| `openspec/changes/enforce-property-scoped-access/tasks.md` | Marked completed apply tasks and budget checkpoints. |
| `openspec/changes/enforce-property-scoped-access/apply-progress.md` | Recorded strict-TDD evidence, validation, split decision, and remote-policy boundary. |

## TDD Cycle Evidence

| Work Unit | Phase | Evidence | Command | Result |
| --------- | ----- | -------- | ------- | ------ |
| A1/A3/A5/A7 | RED | Added `propertyScope.test.ts` before `propertyScope.ts` existed, covering scope validation, query scoping, payload ownership, mutation checks, and table registries. | `npm run test:run -- src/shared/services/propertyScope.test.ts` | FAIL expected — missing `./propertyScope`. |
| A2/A4/A6/A7 | GREEN | Added `propertyScope.ts` with validation, query helpers, payload/mutation helpers, and table registries. | `npm run test:run -- src/shared/services/propertyScope.test.ts` | PASS — 1 file, 15 tests. |
| A8 | REFACTOR | Fixed build-time generic payload typing by allowing domain payload fields while keeping `property_id` controlled by session scope. | `npm run test:run -- src/shared/services/propertyScope.test.ts`, `npm run build` | PASS — focused tests passed; build passed after type cleanup. |
| B1/B2 | GREEN | Added concise architecture docs in English and Spanish after Work Unit A stayed below budget. | Documentation review | PASS — bilingual meaning aligned. |
| B3/B4 | TRIANGULATE/REFACTOR | Recorded remote policy boundary, checked scope exclusions, and ran final validation. | `npm run test:run`, `npm run lint`, `npm run build`, `git diff --check` | PASS — validation completed; Vite chunk-size warning remains non-blocking. |

## Validation Commands

| Command | Result |
| ------- | ------ |
| `npm run test:run -- src/shared/services/propertyScope.test.ts` | PASS — 1 file, 15 tests. |
| `npm run test:run` | PASS — 15 files, 83 tests. |
| `npm run lint` | PASS — no errors or warnings. |
| `npm run build` | PASS — TypeScript and Vite build completed; Vite reported the existing-style chunk-size warning for the built app bundle. |
| `git diff --check` | PASS — no whitespace errors. |

## Decisions and Discoveries

- Property scope is represented structurally as `{ propertyId }` so shared services do not import React, auth hooks, JSX, app shell code, feature services, or InsForge SDK types.
- Operational queries use `property_id = scope.propertyId`; the `properties` root uses `id = scope.propertyId`.
- `assignPropertyOwnership()` never treats caller-supplied `property_id` as authoritative. It injects the session property when absent, normalizes a matching value, and rejects mismatches.
- `assertSameProperty()` supports future services that can detect a target record's property before reporting a mutation as successful.
- `PROPERTY_OWNED_TABLES` follows the canonical database schema table set, while `properties` is treated as a scoped root table.
- `PropertyOwnedPayload` allows arbitrary domain payload fields while keeping `property_id` optional and controlled by the helper.

## Remote Policy Boundary

No remote InsForge/PostgreSQL RLS, policies, functions, migrations, or MCP changes were applied in issue #7.

Repository/service helpers are now the required frontend/service pattern, but they are not complete database-level isolation. A future remote-policy slice must first satisfy these gates:

1. confirm supported InsForge SQL auth/JWT identity helper;
2. represent policies as versioned SQL;
3. validate remote cross-property denial;
4. document rollback SQL and remote rollback steps;
5. get owner approval before remote application.

## Deviations from Design

- The implementation stayed in a single `src/shared/services/propertyScope.ts` file because the helper API remained compact. No additional split into table/query modules was needed.
- Work Unit B documentation was included in the same PR because Work Unit A stayed below the 400-line budget.

## Remaining Tasks

- Run independent verify after PR review/acceptance.
- Sync `property-scoped-access` into canonical OpenSpec specs after verification passes.
- Archive `openspec/changes/enforce-property-scoped-access/` after sync and verification pass.
