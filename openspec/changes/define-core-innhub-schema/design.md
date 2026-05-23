# Design — define-core-innhub-schema

## Purpose

Design how issue #6 will turn the approved InnHub ERD into a versioned PostgreSQL schema migration, validated locally first and then applied to InsForge. This document does not implement SQL, create tasks, or apply anything remotely.

## Design Summary

| Area | Decision |
| --- | --- |
| Migration path | `database/migrations/001_define_core_innhub_schema.sql` |
| Rollback path | Companion rollback file: `database/migrations/001_define_core_innhub_schema.down.sql` |
| Local validation | Vitest migration contract test at `src/shared/services/databaseMigration.test.ts` |
| Remote application | Use InsForge raw SQL only after repository tests pass during apply |
| Remote evidence | Use InsForge metadata/table-schema/raw SQL inspection and record results in apply/verify artifacts |
| UUID strategy | PostgreSQL `gen_random_uuid()` defaults via `pgcrypto` extension if supported |
| Timestamp strategy | `created_at` and `updated_at` with `now()` defaults; no `updated_at` trigger in issue #6 |
| Enum strategy | Native PostgreSQL enums for approved stable states |
| Property integrity | Use `property_id` on operational tables plus composite uniqueness/FKs for high-value cross-property relationships where reviewable; defer full policy/RLS to issue #7 |
| Review strategy | Auto-forecast against 400 changed lines; split if migration + tests exceed review budget |

## Implementation Path

The later apply phase should proceed in this order:

1. Add failing Vitest migration contract tests.
2. Add the versioned SQL migration.
3. Add the companion rollback SQL.
4. Run `npm run test:run` until migration contract tests pass.
5. Run `npm run lint` and `npm run build` if TypeScript test/helper changes require them.
6. Apply the migration to InsForge using raw SQL.
7. Validate remote schema through InsForge metadata/table/schema inspection.
8. Record local and remote evidence in apply/verify artifacts.

## Migration Files

### Up migration

Use:

```text
database/migrations/001_define_core_innhub_schema.sql
```

Rationale:

- `database/migrations/` is explicit and backend-agnostic while still matching InsForge/PostgreSQL.
- `001_` creates a stable ordering convention before there are multiple migrations.
- The filename states the domain outcome instead of a timestamp-only label.
- SQL remains reviewable and reproducible outside the InsForge console.

### Down migration

Use:

```text
database/migrations/001_define_core_innhub_schema.down.sql
```

Rationale:

- A companion rollback file keeps destructive rollback separate from the apply migration.
- Reviewers can inspect rollback intent without risking accidental execution.
- Future migrations can follow the same `NNN_name.sql` / `NNN_name.down.sql` convention.

Rollback should drop tables before enum types, in reverse dependency order. It should be documented as intended for development/validation environments only until production rollback policy exists.

## SQL Organization

The up migration should be organized with clear section comments in this order:

1. **Extensions and defaults**
   - Enable `pgcrypto` for `gen_random_uuid()` if supported by InsForge/PostgreSQL.
2. **Enums**
   - Create the 12 approved native enum types.
3. **Root and identity tables**
   - `properties`, `profiles`, `guests`.
4. **Inventory tables**
   - `room_types`, `rooms`.
5. **Reservation and stay tables**
   - `reservations`, `reservation_items`, `stays`, `stay_guests`.
6. **Operations tables**
   - `housekeeping_tasks`, `maintenance_tickets`.
7. **Billing tables**
   - `invoices`, `payments`.
8. **Indexes and uniqueness constraints**
   - Property-scoped lookups, identifiers, invoice numbers, auth linkage.
9. **Comments**
   - Minimal table/column comments for non-obvious domain rules.

This ordering keeps dependencies readable and avoids forward references.

## UUID and Timestamp Strategy

### UUIDs

Use UUID primary keys with defaults:

```sql
id uuid primary key default gen_random_uuid()
```

Design assumption: InsForge/PostgreSQL supports `pgcrypto` and `gen_random_uuid()`. The apply phase must confirm this before remote execution. If InsForge rejects extension creation or `gen_random_uuid()`, pause and record a design deviation before replacing the strategy.

### Timestamps

Use:

```sql
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

Do not add an automatic `updated_at` trigger in issue #6. Triggers increase migration length and behavior scope. Later service-layer or workflow issues can either set `updated_at` explicitly or add a shared update trigger if the project chooses that convention.

## Native Enum Strategy

Create native PostgreSQL enums for the approved stable values:

| Enum | Values |
| --- | --- |
| `profile_role` | `administrator`, `manager`, `receptionist`, `housekeeping`, `maintenance` |
| `profile_status` | `active`, `inactive` |
| `room_state` | `available`, `occupied`, `cleaning`, `maintenance`, `inactive` |
| `reservation_status` | `pending`, `confirmed`, `partially_checked_in`, `checked_in`, `cancelled`, `no_show` |
| `reservation_item_status` | `pending`, `confirmed`, `checked_in`, `cancelled`, `no_show` |
| `stay_status` | `active`, `checked_out`, `cancelled` |
| `housekeeping_status` | `pending`, `in_progress`, `completed`, `cancelled` |
| `maintenance_status` | `open`, `in_progress`, `resolved`, `cancelled` |
| `task_priority` | `low`, `normal`, `high`, `urgent` |
| `invoice_status` | `pending`, `partial`, `paid`, `void` |
| `payment_method` | `cash`, `card`, `bank_transfer`, `other` |
| `payment_status` | `recorded`, `voided` |

Tradeoff:

- Native enums strongly protect domain values and match the user-approved ERD.
- Evolving native enums requires explicit follow-up migrations.
- This is acceptable because the project intentionally completed ERD analysis before schema implementation.

## Table Design Notes

### Properties, profiles, guests

- `properties` is the root entity.
- `profiles.id` is InnHub's internal staff identity.
- `profiles.auth_user_id` is unique and stores external auth linkage.
- `profiles.property_id` is required to preserve one-property users in the MVP.
- `guests` represents contacts, customers, occupants, invoice recipients, and payers.

Recommended constraints/indexes:

- `profiles.auth_user_id unique`.
- `profiles.email unique` only if design/apply confirms email is globally unique in the MVP. If uncertain, prefer `(property_id, email)` where email is present.
- Guest document uniqueness should be conservative because document fields are nullable. Prefer an index only if the SQL remains simple and reviewable.

### Room types and rooms

- `room_types` stores category/template data only.
- Do not include `quantity` or any stored inventory count.
- `rooms.identifier` replaces numeric-only room number.
- Add `unique(property_id, identifier)`.
- `room_state` must not include `reserved`.

### Reservations, items, stays, guests

- `reservations` stores the booking header and planned date range.
- `reservation_items` stores each requested room/category.
- `reservation_items.room_id` is nullable for category-level reservations.
- `stays` stores actual room occupation and always references a concrete `room_id`.
- `stays.reservation_item_id` is nullable for walk-ins.
- `stay_guests` links actual occupants to stays.

Simple foundational checks should include:

- `planned_check_out_date > planned_check_in_date` on `reservations`.
- `guest_count > 0` where `guest_count` exists.
- `expected_check_out_date >= actual_check_in_at::date` or a similarly simple non-negative stay date check if this can be expressed cleanly.

Advanced overlap prevention remains out of scope for issue #6.

### Operations

- `housekeeping_tasks` references `property_id`, `room_id`, optional `stay_id`, optional `assigned_to_profile_id`.
- `maintenance_tickets` references `property_id`, `room_id`, optional reporter/assignee profiles, and includes `blocks_availability`.
- Do not implement automatic check-out to cleaning-task creation in this issue.

### Billing

- `invoices` supports optional `guest_id`, `reservation_id`, and `stay_id`.
- Add a check that at least one of `guest_id`, `reservation_id`, or `stay_id` is present.
- `payments` references invoices and stores only manual tracking fields.
- Do not add gateway/provider/webhook fields.

Simple amount checks should include non-negative invoice amounts and positive payment amount.

## Cross-Property Integrity Strategy

Property isolation needs structural support now, but full access enforcement belongs to issue #7.

Recommended issue #6 approach:

1. Add `property_id not null references properties(id)` to all operational tables.
2. Add simple FKs for direct relationships for clarity and compatibility.
3. Add composite `unique(id, property_id)` on parent operational tables where child tables should validate same-property references.
4. Use composite FKs for high-risk cross-property relationships if SQL remains reviewable, for example:
   - `rooms(room_type_id, property_id)` → `room_types(id, property_id)`.
   - `reservations(primary_guest_id, property_id)` → `guests(id, property_id)`.
   - `reservation_items(reservation_id, property_id)` → `reservations(id, property_id)`.
   - `reservation_items(room_type_id, property_id)` → `room_types(id, property_id)`.
   - `stays(room_id, property_id)` → `rooms(id, property_id)`.
   - `stay_guests(stay_id, property_id)` → `stays(id, property_id)`.
   - `payments(invoice_id, property_id)` → `invoices(id, property_id)`.
5. If composite FKs become too verbose or InsForge rejects them, keep simple FKs plus `property_id` and explicitly defer complete cross-property enforcement to issue #7.

Tradeoff:

- Composite FKs improve data integrity immediately.
- They increase migration length and review complexity.
- The apply phase should prefer composite FKs for the most important relationships but may defer low-risk relationships if the 400-line budget is exceeded.

## Updated At Handling

Do not create update triggers in this change.

Reasons:

- The issue is a schema foundation, not behavior automation.
- Trigger boilerplate increases changed lines.
- Future services can set `updated_at` explicitly.
- If automatic timestamp maintenance becomes necessary, add one shared trigger in a later focused change.

## Migration Validators and TDD Plan

### Test path

Use:

```text
src/shared/services/databaseMigration.test.ts
```

Rationale:

- The project already uses Vitest under `npm run test:run`.
- `src/shared/services` already contains backend/environment service tests.
- Tests can inspect migration text without requiring a live database.

### Validator scope

The test should read `database/migrations/001_define_core_innhub_schema.sql` as text and assert critical contract markers:

- migration file exists;
- all required enum type names appear;
- enum values include approved values and exclude prohibited values such as `reserved`, `out_of_service`, `draft`, and `payment_due`;
- all 13 required table names appear as `create table` statements;
- operational tables include `property_id`;
- `profiles` includes `auth_user_id` and a unique constraint/index;
- `room_types` does not include `quantity`;
- `rooms` includes `identifier` and property-scoped uniqueness;
- `reservation_items` includes nullable `room_id` and `status`;
- `stays` includes nullable `reservation_item_id` and concrete `room_id`;
- `stay_guests` exists;
- `payments` contains no gateway/provider/webhook/token fields.

### RED/GREEN evidence

Apply should record:

| Step | Expected result |
| --- | --- |
| RED | Migration validator fails because migration file/schema markers are absent. |
| GREEN | Migration validator passes after SQL migration is added. |
| REFACTOR | SQL comments/formatting/constraints are cleaned without changing test intent. |

The repository-level validator is required for strict TDD. Remote InsForge validation is integration evidence, not a substitute for local tests.

## InsForge Application and Validation Design

Do not apply anything during design. During later apply, after local tests pass:

1. Read the migration SQL from `database/migrations/001_define_core_innhub_schema.sql`.
2. Apply it through InsForge raw SQL (`insforge_run-raw-sql`) if the MCP connection is available.
3. Inspect backend metadata (`insforge_get-backend-metadata`) to confirm schema objects exist.
4. Inspect representative tables (`insforge_get-table-schema`) such as:
   - `properties`;
   - `profiles`;
   - `rooms`;
   - `reservation_items`;
   - `stays`;
   - `invoices`;
   - `payments`.
5. If enum metadata is not exposed directly, validate enum values with raw SQL queries against PostgreSQL catalogs.
6. Record exact commands/tools and results in apply/verify evidence.

Evidence should confirm:

- required tables exist remotely;
- required enum types and values exist remotely;
- key columns and nullability match the migration;
- key uniqueness/FK constraints exist or any deviations are documented;
- no seed data or feature behavior was added.

## Review Workload Forecast

Estimated changed lines for apply:

| Work unit | Estimated changed lines |
| --- | ---: |
| Up migration SQL | 300–450 |
| Down migration SQL | 80–160 |
| Vitest migration validator | 80–140 |
| Apply evidence artifact | 40–80 |
| Total | 500–830 |

This likely exceeds the 400 changed-line review budget.

### Split strategy

Use `auto-forecast` with a planned pause before apply if tasks confirm the estimate.

Preferred split if required:

1. **PR/work unit A: repository schema contract**
   - Up migration.
   - Down migration.
   - Migration validator test.
   - Local TDD evidence.
2. **PR/work unit B: InsForge application and validation evidence**
   - Remote application evidence.
   - Metadata/table-schema validation report.
   - Any small follow-up migration fix only if required and approved.

If the actual SQL is compact enough to keep the total near 400 changed lines, a single PR may still be acceptable, but tasks must explicitly forecast this before apply.

## Alternatives Considered

| Alternative | Reason not chosen |
| --- | --- |
| Apply schema manually in InsForge first | Not reproducible or reviewable enough for academic defense and future maintenance. |
| Store schema only in docs/ERD | Does not create executable backend foundation for later issues. |
| Use text + CHECK instead of native enums | User selected native PostgreSQL enums after ERD analysis; enums provide stronger domain integrity. |
| Add automatic `updated_at` triggers now | Adds behavior and boilerplate outside the minimum schema foundation. |
| Implement full overlap prevention now | Belongs to issue #15 and risks over-scoping issue #6. |
| Implement full RLS/policies now | Belongs to issue #7; issue #6 should prepare structural `property_id` support. |
| One migration file with embedded down SQL comments | Harder to execute safely and less clear than a companion down file. |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Migration exceeds review budget | Forecast in tasks and split repository migration from remote application if needed. |
| InsForge does not allow `create extension pgcrypto` | Pause during apply and switch only with explicit design deviation. |
| Composite FKs become too verbose or unsupported | Use simple FKs plus `property_id`, then defer complete enforcement to issue #7 with documented rationale. |
| Native enum values need future changes | Require explicit follow-up migrations; keep issue #6 values aligned with approved ERD. |
| Text validators miss SQL semantic issues | Use validators for TDD contract and InsForge application for integration validation. |
| Remote schema application partially succeeds | Record exact remote state and use rollback/down SQL or development schema reset per approved apply plan. |
| `updated_at` defaults are mistaken for automatic update behavior | Document that services/workflows must update the field until a trigger convention is introduced. |

## Acceptance Mapping

| Spec requirement | Design response |
| --- | --- |
| Versioned SQL migration | `database/migrations/001_define_core_innhub_schema.sql` |
| Native enums | Dedicated enum section before table creation |
| Core tables | ERD-driven table order from root through billing |
| Property scope | Required `property_id` plus composite-FK strategy where reviewable |
| Profile identity | Internal `profiles.id` plus unique `auth_user_id` |
| Inventory decisions | No `room_types.quantity`; `rooms.identifier` unique per property |
| Reservation/stay separation | Dedicated `reservations`, `reservation_items`, `stays`, `stay_guests` sections |
| Billing/manual payments | Invoice/payment tables with no gateway fields |
| Migration TDD | Vitest text contract under `npm run test:run` |
| InsForge evidence | Raw SQL application plus metadata/table-schema validation during apply |
| Scope boundaries | No seeds, CRUD, auth UI, workflows, overlap triggers, dashboard, or gateway integration |

## Open Questions for Tasks/Apply

- Confirm exact InsForge support for `pgcrypto`/`gen_random_uuid()` before remote execution.
- Decide during tasks whether composite FK coverage fits within review budget.
- Decide whether to include conservative partial unique indexes for nullable guest document fields in the first migration or defer to guest CRUD issue.
- Confirm whether `profiles.email` should be globally unique or unique per property before writing SQL.
