# Tasks — define-core-innhub-schema

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–830 total; split A ~380–670, split B ~80–160 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR A: repository schema contract → PR B: InsForge application and validation |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Split delivery is confirmed by the user. For InnHub's permanent-branch workflow, treat each work unit as an independently reviewable promotion sequence: implement on `features`, validate through `qa`, then promote to `main` before starting or completing the dependent follow-up where practical.

## Strict TDD Instruction

STRICT TDD MODE IS ACTIVE. Test runner: `npm run test:run`. Follow RED, GREEN, TRIANGULATE, REFACTOR. Record evidence in `openspec/changes/define-core-innhub-schema/apply-progress.md` during apply.

Remote InsForge validation is required integration evidence, but it does not replace repository-level migration tests.

## Dependencies and Blockers

- Approved baseline: `docs/08-database-erd.md` and `openspec/changes/define-core-innhub-schema/design.md`.
- Required local command: `npm run test:run`.
- Run `npm run lint` when TypeScript validator changes are present.
- Run `npm run build` before reporting app-affecting TypeScript changes complete.
- Before remote apply, confirm InsForge supports `pgcrypto` / `gen_random_uuid()`.
- If InsForge rejects composite FKs or extension SQL, pause and document the design deviation before changing migration strategy.

## Work Unit A — Repository Schema Contract

Goal: create a reviewable, versioned SQL schema contract with local TDD validation. Do not apply anything to InsForge in this work unit.

### RED

- [x] Add failing migration contract tests in `src/shared/services/databaseMigration.test.ts`.
  - Verify `database/migrations/001_define_core_innhub_schema.sql` exists.
  - Verify all 12 enum names and approved values appear.
  - Verify prohibited drift is absent: `reserved`, `out_of_service`, `draft`, `payment_due`, `quantity` in `room_types`, and gateway/provider/webhook/token payment fields.
  - Verify all 13 `create table` targets exist: `properties`, `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, `payments`.
  - Verify critical fields: operational `property_id`, `profiles.auth_user_id`, `rooms.identifier`, `reservation_items.room_id`, `reservation_items.status`, `stays.reservation_item_id`, `stays.room_id`, `stay_guests`, `payments.invoice_id`.
- [x] Run `npm run test:run` and record RED failure in `openspec/changes/define-core-innhub-schema/apply-progress.md`.

### GREEN

- [x] Create `database/migrations/001_define_core_innhub_schema.sql`.
  - Add extension/default section for `pgcrypto` / `gen_random_uuid()`.
  - Create native PostgreSQL enums listed in `docs/08-database-erd.md`.
  - Create root/identity tables: `properties`, `profiles`, `guests`.
  - Create inventory tables: `room_types`, `rooms`.
  - Create reservation/stay tables: `reservations`, `reservation_items`, `stays`, `stay_guests`.
  - Create operations tables: `housekeeping_tasks`, `maintenance_tickets`.
  - Create billing tables: `invoices`, `payments`.
  - Add foundational checks: date ordering, positive guest counts, non-negative invoice amounts, positive payment amounts, invoice linked to at least one of `guest_id`, `reservation_id`, `stay_id`.
  - Add uniqueness/indexes: `profiles.auth_user_id`, `rooms(property_id, identifier)`, `invoices(property_id, invoice_number)`, and property-scoped lookup indexes where concise.
  - Prefer high-value composite FKs from design if they fit review budget; otherwise document deferrals to issue #7.
- [x] Create `database/migrations/001_define_core_innhub_schema.down.sql`.
  - Drop dependent tables first, then root tables, then enum types.
  - Keep rollback documented for development/validation environments.
- [x] Run `npm run test:run` until migration validator passes.

### TRIANGULATE

- [x] Strengthen `src/shared/services/databaseMigration.test.ts` against false positives.
  - Check table definitions by section/table name, not only broad substring presence where practical.
  - Check `room_types` table body specifically does not contain `quantity`.
  - Check payment table/enum area specifically does not contain gateway fields.
- [x] Compare migration against `docs/08-database-erd.md` and `openspec/changes/define-core-innhub-schema/specs/database-schema/spec.md`; record any intentional deviation in `apply-progress.md` before proceeding.

### REFACTOR

- [x] Clean SQL ordering/comments in `database/migrations/001_define_core_innhub_schema.sql` without changing schema intent.
- [x] Clean rollback order/comments in `database/migrations/001_define_core_innhub_schema.down.sql`.
- [x] Run validation commands:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build` if TypeScript/app build is affected by the validator test setup.
- [x] Record Work Unit A evidence in `openspec/changes/define-core-innhub-schema/apply-progress.md`.

### Work Unit A rollback

- [ ] Revert `src/shared/services/databaseMigration.test.ts`, `database/migrations/001_define_core_innhub_schema.sql`, `database/migrations/001_define_core_innhub_schema.down.sql`, and Work Unit A evidence if repository validation cannot be completed.

## Work Unit B — InsForge Application and Validation

Goal: apply the already-reviewed migration to InsForge and record remote schema evidence. Depends on Work Unit A passing and being approved.

### Pre-apply checks

- [ ] Confirm Work Unit A is merged/accepted and `npm run test:run` passes on the branch used for remote application.
- [ ] Confirm InsForge MCP connectivity and target backend metadata availability.
- [ ] Confirm or test `pgcrypto` / `gen_random_uuid()` support before full migration execution.

### Remote apply

- [ ] Read `database/migrations/001_define_core_innhub_schema.sql` exactly as committed.
- [ ] Apply SQL to InsForge with MCP tool `insforge_run-raw-sql`.
- [ ] If application partially fails, stop, record error/output, and use approved rollback/reset plan before retrying.

### Remote validation

- [ ] Validate schema inventory with `insforge_get-backend-metadata`.
- [ ] Inspect representative tables with `insforge_get-table-schema`:
  - `properties`
  - `profiles`
  - `rooms`
  - `reservation_items`
  - `stays`
  - `invoices`
  - `payments`
- [ ] Validate enum types/values with `insforge_run-raw-sql` against PostgreSQL catalogs if metadata does not expose enum values.
- [ ] Validate key constraints or document any InsForge capability limitation:
  - `profiles.auth_user_id` uniqueness.
  - `rooms(property_id, identifier)` uniqueness.
  - required `property_id` FKs.
  - invoice relation check.
  - no gateway/payment provider fields.

### Evidence and verification

- [ ] Record exact InsForge MCP tools used and results in `openspec/changes/define-core-innhub-schema/apply-progress.md` or a dedicated validation section.
- [ ] Run final local checks after evidence updates:
  - `npm run test:run`
  - `npm run lint` if TypeScript files changed in this work unit.
  - `npm run build` if app/runtime TypeScript changed.
- [ ] Prepare verify evidence for required tables, enums, property scope, relationship checks, and non-goals.

### Work Unit B rollback

- [ ] Use `database/migrations/001_define_core_innhub_schema.down.sql` or development backend reset only according to approved apply evidence.
- [ ] Record rollback commands/results if rollback is needed.

## Acceptance Mapping

| Spec requirement | Task coverage |
| --- | --- |
| Versioned SQL migration | Work Unit A GREEN creates `database/migrations/001_define_core_innhub_schema.sql`. |
| Native domain enums | Work Unit A tests and migration enum section. |
| Core tables | Work Unit A tests and migration table sections. |
| Property-scoped structure | Work Unit A `property_id` checks/FKs; Work Unit B remote table validation. |
| Profile identity foundation | Work Unit A `profiles.id` + `auth_user_id` migration/tests. |
| Inventory schema | Work Unit A validates `room_types` without `quantity` and `rooms.identifier`. |
| Reservation/stay separation | Work Unit A creates/tests `reservations`, `reservation_items`, `stays`, `stay_guests`. |
| Availability concepts | Work Unit A enum/status/date fields; advanced overlap remains out of scope. |
| Operations schema | Work Unit A creates `housekeeping_tasks` and `maintenance_tickets`. |
| Billing/manual payments | Work Unit A creates `invoices` and `payments`; validator rejects gateway fields. |
| Migration TDD and validation | Work Unit A RED/GREEN/TRIANGULATE/REFACTOR evidence. |
| InsForge application and evidence | Work Unit B raw SQL application plus metadata/table/schema validation. |
| Scope boundaries | Both work units include non-goal checks and evidence. |

## Out of Scope

- Seed/demo data.
- Auth screens, login/logout, session enforcement, or RBAC UI.
- RLS/policy enforcement beyond structural schema preparation.
- Frontend service layer, hooks, or CRUD screens.
- Advanced overlap prevention triggers/exclusion constraints.
- Automatic check-in/check-out mutations or housekeeping generation.
- Maintenance restoration workflow.
- Invoice generation workflow or paid-invoice edit enforcement logic.
- Dashboard/report implementation or persisted analytics tables.
- Payment gateway integrations, tokens, provider charge IDs, webhook secrets, or gateway lifecycle fields.
