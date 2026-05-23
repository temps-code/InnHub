# Apply Progress — define-core-innhub-schema

## Workload / PR Boundary

- Work Unit A — repository schema contract — is merged into QA via PR #34.
- Current boundary: Work Unit B — InsForge application and remote validation.
- Delivery strategy: auto-chain / stacked-to-main as recorded in `tasks.md`.
- Main promotion remains pending until Work Unit B and final verification are complete.

## Completed Tasks

- Added failing migration contract tests before creating the migration SQL.
- Created the versioned up migration at `database/migrations/001_define_core_innhub_schema.sql`.
- Created the rollback migration at `database/migrations/001_define_core_innhub_schema.down.sql`.
- Strengthened migration validators against false positives with table-specific body checks, prohibited drift checks, rollback checks, and scope-boundary checks.
- Tightened the profile identity validator to require `auth_user_id uuid not null unique` specifically.
- Replaced global app Node typings with a test-local Node type reference for the migration validator.
- Updated Work Unit A task checkboxes in `tasks.md`.
- Ran local validation commands for Work Unit A.
- Confirmed InsForge MCP connectivity after re-authentication.
- Confirmed `gen_random_uuid()` works remotely with raw SQL.
- Applied `database/migrations/001_define_core_innhub_schema.sql` to InsForge with `insforge_run-raw-sql`.
- Validated remote table inventory, representative table schemas, enum values, and key constraints.
- Added and remotely validated `stays_reservation_item_key unique (reservation_item_id)` so one reservation item can produce at most one stay while walk-ins with `NULL` remain allowed.

## Files Changed

- `database/migrations/001_define_core_innhub_schema.sql`
- `database/migrations/001_define_core_innhub_schema.down.sql`
- `src/shared/services/databaseMigration.test.ts`
- `tsconfig.app.json`
- `openspec/changes/define-core-innhub-schema/apply-progress.md`
- `openspec/changes/define-core-innhub-schema/tasks.md`

Work Unit B evidence updates:

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

## Work Unit B Remote Evidence

| Step | Tool / command | Result |
| --- | --- | --- |
| Precheck | `npm run test:run` | PASS — 11 test files, 50 tests. |
| MCP auth | `mcp({ connect: "insforge" })` | PASS — InsForge connected after user re-authentication. |
| UUID support | `insforge_run-raw-sql` with `select gen_random_uuid()` | PASS — returned UUID `9f521f97-3b99-4d0f-8b47-b1fe30f4f48b`. |
| Pre-apply metadata | `insforge_get-backend-metadata` | PASS — backend initially reported no user tables. |
| Remote apply | `insforge_run-raw-sql` using `database/migrations/001_define_core_innhub_schema.sql` | PASS — SQL executed successfully. |
| Table inventory | `insforge_get-backend-metadata` | PASS — 13 tables found: `properties`, `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, `payments`. |
| Table schema samples | `insforge_get-table-schema` for `properties`, `profiles`, `rooms`, `reservation_items`, `stays`, `invoices`, `payments` | PASS — key columns, defaults, indexes, and FKs are present. |
| Enum validation | `insforge_run-raw-sql` against PostgreSQL enum catalogs | PASS — all 12 enum types and approved values are present. |
| Constraint validation | `insforge_run-raw-sql` against `pg_constraint` | PASS — confirmed `profiles_auth_user_id_key`, `rooms_property_identifier_key`, `invoices_has_subject_check`, `invoices_paid_not_above_total_check`, `payments_invoice_property_fk`, and `rooms_room_type_property_fk`. |
| Stay uniqueness follow-up | `insforge_run-raw-sql` with `alter table stays add constraint stays_reservation_item_key unique (reservation_item_id)` and catalog check | PASS — `stays_reservation_item_key` exists as `UNIQUE (reservation_item_id)`. |
| Key-column validation | `insforge_run-raw-sql` against `information_schema.columns` | PASS — operational tables expose `property_id`; representative key columns are present. |

## Test Commands Run

| Command | Result |
| --- | --- |
| `npm run test:run` | FAIL expected RED — 1 test file failed (`databaseMigration.test.ts`), 10 existing test files passed. |
| `npm run test:run` | PASS — 11 test files passed, 49 tests passed after initial migration. |
| `npm run test:run` | PASS — 11 test files passed, 50 tests passed after triangulation/refactor. |
| `npm run lint` | PASS |
| `npm run build` | PASS — `tsc -b && vite build` completed. |
| `npm run test:run` | PASS — 11 test files passed, 50 tests passed after Work Unit B evidence updates. |
| `npm run lint` | PASS after Work Unit B evidence updates. |
| `npm run build` | PASS — `tsc -b && vite build` completed after Work Unit B evidence updates. |
| `npm run test:run` | PASS — 11 test files passed, 50 tests passed after adding `stays_reservation_item_key`. |
| `npm run lint` | PASS after adding `stays_reservation_item_key`. |
| `npm run build` | PASS after adding `stays_reservation_item_key`. |

## Deviations from Design

- Initially added `node` to `tsconfig.app.json` for the file-system validator, then narrowed that support to a test-local `/// <reference types="node" />` directive after review feedback so app TypeScript globals remain browser-focused.
- Used `on delete restrict` for nullable composite-FK relationships that include non-null `property_id`; this avoids invalid/unsafe `set null` behavior on the shared property-scope column.
- InsForge supports `gen_random_uuid()` in the connected backend; `create extension if not exists pgcrypto` and the full migration executed successfully.

## Remaining Tasks

- Run final local checks after Work Unit B evidence updates.
- Fresh-review Work Unit B evidence and remote schema state.
- Verify/archive/sync the SDD change if Work Unit B review passes.

## Out of Scope Confirmed

- InsForge MCP/raw SQL application was performed only for Work Unit B schema application and validation.
- No seed data was added.
- No auth UI/session behavior was added.
- No frontend service layer or CRUD was added.
- No advanced overlap prevention trigger/exclusion constraint was added.
- No check-in/out automation was added.
- No payment gateway fields were added.
