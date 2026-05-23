# Apply Progress — define-core-innhub-schema

## Workload / PR Boundary

- Current boundary: Work Unit A only — repository schema contract.
- Work Unit B — InsForge application and remote validation — was not performed.
- Delivery strategy: auto-chain / stacked-to-main as recorded in `tasks.md`.
- Review budget note: Work Unit A is a large schema-contract slice and remains above the nominal 400-line budget, but it is the approved split boundary and stays within the forecasted Work Unit A scope.

## Completed Tasks

- Added failing migration contract tests before creating the migration SQL.
- Created the versioned up migration at `database/migrations/001_define_core_innhub_schema.sql`.
- Created the rollback migration at `database/migrations/001_define_core_innhub_schema.down.sql`.
- Strengthened migration validators against false positives with table-specific body checks, prohibited drift checks, rollback checks, and scope-boundary checks.
- Tightened the profile identity validator to require `auth_user_id uuid not null unique` specifically.
- Replaced global app Node typings with a test-local Node type reference for the migration validator.
- Updated Work Unit A task checkboxes in `tasks.md`.
- Ran local validation commands for Work Unit A.

## Files Changed

- `database/migrations/001_define_core_innhub_schema.sql`
- `database/migrations/001_define_core_innhub_schema.down.sql`
- `src/shared/services/databaseMigration.test.ts`
- `tsconfig.app.json`
- `openspec/changes/define-core-innhub-schema/apply-progress.md`
- `openspec/changes/define-core-innhub-schema/tasks.md`

## TDD Cycle Evidence

| Cycle | Phase | Change | Command | Result |
| --- | --- | --- | --- | --- |
| A1 | RED | Added migration contract tests before migration file exists. | `npm run test:run` | FAIL — `database/migrations/001_define_core_innhub_schema.sql` missing; 7 migration tests failed while existing tests passed. |
| A1 | GREEN | Added up/down SQL migrations with approved enums, tables, constraints, indexes, and rollback ordering. | `npm run test:run` | PASS — 11 test files passed, 49 tests passed. |
| A1 | TRIANGULATE | Strengthened validator checks for rollback file, table-specific critical fields, invoice subject check, date/amount checks, and no triggers/exclusion constraints. | `npm run test:run` | PASS — 11 test files passed, 50 tests passed. |
| A1 | REFACTOR | Cleaned SQL FK delete behavior for composite optional relations and enabled Node test types for the file-system validator. | `npm run test:run` | PASS — 11 test files passed, 50 tests passed. |
| A2 | REFACTOR | Addressed review follow-ups: narrowed Node typings to the migration test file and tightened `auth_user_id` uniqueness validation. | `npm run test:run`, `npm run lint`, `npm run build` | PASS — local validation remained green. |

## Test Commands Run

| Command | Result |
| --- | --- |
| `npm run test:run` | FAIL expected RED — 1 test file failed (`databaseMigration.test.ts`), 10 existing test files passed. |
| `npm run test:run` | PASS — 11 test files passed, 49 tests passed after initial migration. |
| `npm run test:run` | PASS — 11 test files passed, 50 tests passed after triangulation/refactor. |
| `npm run lint` | PASS |
| `npm run build` | PASS — `tsc -b && vite build` completed. |

## Deviations from Design

- Initially added `node` to `tsconfig.app.json` for the file-system validator, then narrowed that support to a test-local `/// <reference types="node" />` directive after review feedback so app TypeScript globals remain browser-focused.
- Used `on delete restrict` for nullable composite-FK relationships that include non-null `property_id`; this avoids invalid/unsafe `set null` behavior on the shared property-scope column.
- Full InsForge support for `pgcrypto` / `gen_random_uuid()` remains unconfirmed because Work Unit B was intentionally not performed.

## Remaining Tasks

- Work Unit B: apply the reviewed SQL migration to InsForge.
- Work Unit B: validate remote tables, enums, and key constraints with InsForge metadata/table-schema/raw SQL.
- Work Unit B: record remote application and rollback evidence if needed.

## Out of Scope Confirmed

- No InsForge MCP/raw SQL application was performed.
- No seed data was added.
- No auth UI/session behavior was added.
- No frontend service layer or CRUD was added.
- No advanced overlap prevention trigger/exclusion constraint was added.
- No check-in/out automation was added.
- No payment gateway fields were added.
