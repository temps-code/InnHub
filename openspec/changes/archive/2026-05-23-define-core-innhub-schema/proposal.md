# Proposal — define-core-innhub-schema

## Change ID

`define-core-innhub-schema`

## Related Issue

- Issue #6: `feat(database): define core InnHub schema`

## Intent

Define InnHub's core InsForge/PostgreSQL schema as a versioned, reviewable migration before building backend services, CRUD screens, seed data, or operational workflows. This change turns the approved database ERD into an auditable schema foundation that future MVP slices can apply, validate, and extend with minimal structural churn.

The implementation path should be two-step: first create and test the SQL migration in the repository, then apply that migration to InsForge and validate the resulting schema.

## Problem

InnHub now has an approved database-level ERD documented in `docs/08-database-erd.md`, but the schema is not yet represented as versioned SQL or applied to the backend. Without a committed schema foundation, later issues for auth, property scoping, room inventory, reservations, check-in/out, housekeeping, maintenance, billing, and dashboard metrics may invent incompatible table shapes or rely on manual InsForge changes that are hard to review and reproduce.

Issue #6 must establish the database structure clearly before feature implementation begins, while avoiding scope creep into workflows that later issues own.

## Proposed Change

Create the core InnHub schema foundation from the approved ERD:

- add a versioned SQL migration in the repository for the MVP schema;
- define PostgreSQL native enums for stable domain states;
- create the core tables and relationships needed by the MVP;
- add foundational constraints and indexes that support property-scoped data, identifiers, relationships, and basic integrity;
- add tests or validation helpers that exercise the migration file as part of strict TDD during apply;
- after the SQL is implemented and reviewed, apply it to InsForge and validate that the backend schema matches the migration;
- document validation evidence without adding feature behavior.

## Scope

In scope:

- versioned SQL migration for the approved schema baseline;
- PostgreSQL enum definitions for:
  - `profile_role`;
  - `profile_status`;
  - `room_state`;
  - `reservation_status`;
  - `reservation_item_status`;
  - `stay_status`;
  - `housekeeping_status`;
  - `maintenance_status`;
  - `task_priority`;
  - `invoice_status`;
  - `payment_method`;
  - `payment_status`;
- core tables:
  - `properties`;
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
  - `payments`;
- primary keys, foreign keys, required `property_id` columns, timestamps, and simple field-level constraints;
- `profiles.id` as InnHub's internal profile identity plus `auth_user_id` for external auth linkage;
- `room_types` as category/templates without a stored `quantity` field;
- `rooms.identifier` for non-numeric room labels and a uniqueness rule per property;
- separation between `reservations`, `reservation_items`, `stays`, and `stay_guests`;
- billing support for reservation deposits, stays, and manual guest charges;
- manual payment tracking only;
- high-level InsForge application and schema validation after migration implementation.

## Acceptance Boundary

The change is acceptable when:

- the repository contains a versioned SQL migration for the core InnHub schema;
- the migration creates the approved tables and PostgreSQL enums from `docs/08-database-erd.md`;
- operational tables include `property_id` for property-scoped isolation;
- `profiles` contains an internal `id` and a unique `auth_user_id` linkage field;
- `room_types` does not contain `quantity` or another stored inventory count;
- `rooms` uses `identifier` rather than a numeric-only room field;
- `room_state` does not include `reserved`;
- `reservation_items.status = confirmed` is the planned future-availability blocker;
- `stays.status = active` is the actual/current occupancy blocker;
- migration tests or validation helpers run under `npm run test:run` during apply;
- the schema can be applied to InsForge and inspected/validated after application;
- no seed data, CRUD UI, auth UI, frontend service layer, check-in/out automation, advanced availability enforcement, or dashboard/report persistence is introduced.

## Non-goals

Explicitly out of scope:

- seed/demo data for issue #8;
- auth screens, login/logout behavior, or session enforcement for issue #5;
- RLS/policy enforcement or full property-scoped access implementation for issue #7 beyond schema preparation;
- frontend service layer/hooks for issue #9;
- CRUD screens/services for properties, room types, rooms, guests, reservations, billing, housekeeping, maintenance, reports, or dashboard;
- concrete reservation overlap-prevention triggers, exclusion constraints, or transaction-safe availability logic for issue #15;
- automatic check-in/check-out mutations or cleaning-task generation for issues #16-#18;
- full maintenance restoration workflow for issue #19;
- invoice generation logic, paid-invoice mutation protection logic, or payment workflows for issue #20 beyond schema fields;
- dashboard/report implementation or persisted analytics tables for issue #21;
- payment gateway fields or integrations;
- changing the selected backend away from InsForge/PostgreSQL.

## Affected Areas

Likely implementation areas for later phases:

- a new database/migration path, to be finalized in design, such as `database/migrations/*` or `supabase/migrations/*`-style naming adapted for InsForge/PostgreSQL;
- migration-focused tests or validation helpers under an appropriate test location;
- optional apply/validation notes in the OpenSpec change directory;
- InsForge backend schema state after the migration is applied during the apply phase.

Existing docs such as `docs/08-database-erd.md` should remain the source baseline unless later design discovers a required schema adjustment.

## Dependencies

- Issue #4 completed the InsForge backend environment foundation.
- `docs/08-database-erd.md` and `docs/03-domain-model.md` define the approved ERD and domain rules.
- `docs/04-tech-stack.md` identifies InsForge + PostgreSQL as the target backend/database path.
- `docs/07-functional-specification.md` maps the schema domains to FR-01 through FR-16.
- `openspec/config.yaml` enables strict TDD and uses `npm run test:run` for apply/verify.
- InsForge schema tooling/MCP details should be confirmed during design/apply before remote application.

## Validation Strategy

Strict TDD should be adapted to the migration artifact:

1. write focused tests or validation helpers that initially fail because the migration file/schema definitions do not exist;
2. implement the SQL migration until those tests pass;
3. run `npm run test:run` as the primary TDD validation;
4. run `npm run lint` and `npm run build` if TypeScript validation helpers or app code are affected;
5. apply the migration to InsForge after the repository migration is complete;
6. validate the remote schema by inspecting tables/enums/relationships through InsForge-supported metadata or SQL queries;
7. record evidence in later apply/verify artifacts.

The InsForge application validates integration, but it does not replace the repository-level TDD checks.

## Issue Interactions

- Issue #6 provides the schema foundation for issues #5 and #7-#21.
- Issue #5 can link auth users to `profiles.auth_user_id` and one property.
- Issue #7 can enforce property-scoped access using `property_id` and cross-property integrity rules prepared here.
- Issues #10-#14 can build CRUD and reservation flows against these table contracts.
- Issue #15 can implement robust overlap prevention using the reservation/stay statuses and date fields defined here.
- Issues #16-#20 can implement operational workflows and billing behavior on top of `stays`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, and `payments`.
- Issue #21 can derive dashboard metrics from the base tables rather than persisted report tables.

## Rollout and Review Considerations

Recommended rollout style for later phases:

1. proposal approval;
2. spec acceptance criteria for tables, enums, constraints, and validation;
3. design decisions for migration path, naming, UUID defaults, timestamps, FK/constraint strategy, and InsForge validation;
4. tasks with review workload forecast;
5. RED migration tests/validators;
6. SQL migration implementation;
7. local test/lint/build validation as applicable;
8. InsForge application and schema validation;
9. archive/sync once verify passes.

Review workload risk is medium to high because a full schema migration can exceed the 400 changed-line budget. The delivery strategy is `auto-forecast`: tasks/design should forecast changed lines and either keep a single PR if the migration remains reviewable, or split into chained work units if the SQL plus tests exceed the budget.

Likely work-unit split if needed:

- schema migration plus migration tests;
- InsForge application/validation evidence;
- documentation/spec synchronization if schema details change.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| SQL migration grows beyond the 400-line review budget | Forecast during tasks; split into chained work units if needed. |
| Manual InsForge changes become unreproducible | Create versioned SQL first, then apply it remotely. |
| ERD and SQL drift | Treat `docs/08-database-erd.md` as the baseline and record any necessary deviations in design/spec before implementation. |
| Property isolation is only partially enforced | Include `property_id` everywhere and design cross-property FK/constraint strategy before apply. |
| Availability scope expands into complex overlap enforcement | Define fields/statuses now; defer robust overlap prevention implementation to issue #15. |
| Auth scope expands into login/session work | Limit this issue to `profiles` schema support and defer auth behavior to issue #5. |
| Native enums become hard to evolve | Use only user-approved stable enum values and document any future changes as explicit migrations. |
| InsForge schema capabilities differ from assumed PostgreSQL features | Confirm InsForge-supported SQL/metadata behavior during design/apply before remote application. |

## Rollback

Rollback should be designed before apply:

- repository rollback: revert the migration file, tests/validators, and any apply evidence artifacts;
- remote rollback: apply a deliberate down/cleanup SQL script or reset the development InsForge schema according to the approved design;
- no frontend, seed data, auth UI, service layer, or user workflow state should need rollback because those are out of scope.

## Success Criteria

- InnHub has a versioned SQL schema foundation aligned with the approved ERD.
- The schema includes the required tables, enums, relationships, and simple constraints for MVP backend slices.
- Property-scoped data isolation is structurally supported by `property_id` and planned FK/constraint strategy.
- Migration-level tests or validators satisfy strict TDD expectations during apply.
- The migration can be applied to InsForge and validated with schema evidence.
- Later issues can implement auth, security, services, CRUD, availability, operations, billing, and dashboard work without redefining the base schema.
- The implementation remains reviewable within the 400-line budget or is explicitly split before apply.
