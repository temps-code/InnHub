# Database Schema Specification

## Purpose

Define the verifiable database-schema requirements for issue #6. The schema MUST be introduced as a versioned SQL migration first, then applied to InsForge/PostgreSQL and validated with evidence before later MVP feature slices build on it.

## Requirements

### Requirement: Versioned SQL Migration

The system MUST provide a repository-tracked SQL migration that defines the core InnHub schema before any remote InsForge schema application is treated as complete.

#### Scenario: Migration exists before backend application

- GIVEN issue #6 is applied
- WHEN reviewers inspect the repository
- THEN they MUST find a versioned SQL migration for the core InnHub schema
- AND the migration MUST be committed in a stable migration path chosen during design
- AND the migration MUST be reviewable without relying on manual InsForge console changes

#### Scenario: Migration remains aligned with the approved ERD

- GIVEN the migration is reviewed
- WHEN its schema definitions are compared with `docs/08-database-erd.md`
- THEN it MUST define the approved core schema baseline
- AND any intentional deviation MUST be documented in the change artifacts before implementation is accepted

### Requirement: Native Domain Enums

The migration MUST define PostgreSQL native enums for stable InnHub domain states and classifications.

#### Scenario: Required enums are defined

- GIVEN reviewers inspect the migration
- WHEN they look for enum definitions
- THEN the migration MUST define `profile_role`, `profile_status`, `room_state`, `reservation_status`, `reservation_item_status`, `stay_status`, `housekeeping_status`, `maintenance_status`, `task_priority`, `invoice_status`, `payment_method`, and `payment_status`

#### Scenario: Enum values match the approved ERD

- GIVEN the enum definitions are inspected
- WHEN their values are compared with the approved ERD documentation
- THEN `room_state` MUST include `available`, `occupied`, `cleaning`, `maintenance`, and `inactive`
- AND `room_state` MUST NOT include `reserved`
- AND `invoice_status` MUST use `pending`, `partial`, `paid`, and `void`
- AND payment enums MUST support manual tracking without gateway-specific states

### Requirement: Core Tables

The migration MUST create the core tables needed by the InnHub MVP schema foundation.

#### Scenario: Required tables are created

- GIVEN reviewers inspect the migration or validated remote schema
- WHEN they list the core tables
- THEN the schema MUST include `properties`, `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, and `payments`

#### Scenario: Tables have foundational identifiers and timestamps

- GIVEN a core mutable table is inspected
- WHEN its columns are reviewed
- THEN it MUST have a primary key suitable for repository and InsForge validation
- AND it SHOULD include `created_at`, `updated_at`, and `deleted_at` (for soft-delete support) unless design documents a justified exception

### Requirement: Soft Delete Column

All 13 core tables MUST include a `deleted_at timestamptz DEFAULT NULL` column added via migration 002.

#### Scenario: Column added to every table

- GIVEN migration 002 is applied
- WHEN reviewers inspect `properties`, `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, and `payments`
- THEN each table MUST have `deleted_at timestamptz DEFAULT NULL`

### Requirement: Partial Unique Indexes

Three UNIQUE constraints MUST be replaced with partial unique indexes `WHERE deleted_at IS NULL`: `room_types(property_id, name)`, `rooms(property_id, identifier)`, `profiles(property_id, email)`.

#### Scenario: Duplicate name allowed after soft delete

- GIVEN a soft-deleted room type "Standard Queen" exists
- WHEN creating a new room type with the same name
- THEN the insert MUST succeed
- AND a duplicate active name MUST still be rejected

#### Scenario: Existing UNIQUE constraints preserved

- GIVEN migration 002 is applied
- WHEN reviewers inspect constraint changes
- THEN `properties.slug`, `invoices(property_id, invoice_number)`, and `stay_guests(stay_id, guest_id)` MUST retain their UNIQUE constraints unchanged

### Requirement: Soft-Delete Performance Indexes

Five tables MUST get a composite index `(property_id, deleted_at)` for efficient filtered queries: `room_types`, `rooms`, `guests`, `profiles`, `reservations`.

#### Scenario: Indexes exist after migration

- GIVEN migration 002 is applied
- WHEN reviewers inspect index definitions
- THEN `room_types`, `rooms`, `guests`, `profiles`, and `reservations` MUST each have an index on `(property_id, deleted_at)`

### Requirement: Down Migration Warning

The down migration (002_down.sql) MUST document the risk of duplicate conflicts when reverting partial indexes to UNIQUE constraints.

#### Scenario: Rollback documents duplicate risk

- GIVEN reviewers inspect 002_down.sql
- WHEN they read the file header
- THEN it MUST contain a documented warning that records created after soft-delete may violate restored UNIQUE constraints
- AND suggest resolving conflicts manually before reverting

### Requirement: Property-Scoped Structure

The schema MUST structurally support property-scoped data isolation for operational records.

#### Scenario: Operational records include property scope

- GIVEN reviewers inspect operational tables
- WHEN they check for property ownership
- THEN `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, and `payments` MUST include `property_id`
- AND each `property_id` MUST reference `properties.id`

#### Scenario: Cross-property relationships are designable

- GIVEN a child row references another operational row
- WHEN the migration defines foreign keys or constraints
- THEN the schema MUST preserve enough `property_id` information to prevent or later enforce cross-property relationship violations
- AND full RLS or policy enforcement MAY be deferred to issue #7

### Requirement: Profile Identity Foundation

The schema MUST model InnHub staff profiles with an internal profile identity and an external auth linkage.

#### Scenario: Profiles use internal identity plus auth linkage

- GIVEN the `profiles` table is inspected
- WHEN reviewers check identity columns
- THEN `profiles` MUST have its own internal `id`
- AND `profiles` MUST have `auth_user_id`
- AND `auth_user_id` MUST be unique
- AND `profiles` MUST belong to exactly one property in the MVP through `property_id`

#### Scenario: Auth behavior remains out of scope

- GIVEN issue #6 is reviewed
- WHEN reviewers inspect the change
- THEN the schema MAY prepare profile/auth linkage fields
- BUT the change MUST NOT implement login screens, logout behavior, session enforcement, or role-based UI access

### Requirement: Inventory Schema

The schema MUST represent room categories and physical rooms according to the approved ERD decisions.

#### Scenario: Room types are categories, not inventory counts

- GIVEN the `room_types` table is inspected
- WHEN reviewers check its columns
- THEN it MUST support category/template data such as name, description, capacity, and base price
- AND it MUST NOT include `quantity` or another stored room-count field
- AND real inventory counts MUST be derivable from `rooms` grouped by `room_type_id`

#### Scenario: Rooms use flexible identifiers

- GIVEN the `rooms` table is inspected
- WHEN reviewers check room identification
- THEN `rooms` MUST use `identifier` for user-facing room labels
- AND `identifier` MUST allow non-numeric labels such as `A1` or `PB-03`
- AND the schema MUST enforce uniqueness of active room identifiers per property via a partial index `WHERE deleted_at IS NULL`

#### Scenario: Rooms do not use a physical reserved state

- GIVEN room states are inspected
- WHEN reviewers check the `room_state` enum and `rooms` table
- THEN the schema MUST support physical states `available`, `occupied`, `cleaning`, `maintenance`, and `inactive`
- AND future reservations MUST NOT be represented by a physical `reserved` room state

### Requirement: Reservation and Stay Separation

The schema MUST separate planned bookings from actual room occupation.

#### Scenario: Reservation header and items are distinct

- GIVEN the reservation schema is inspected
- WHEN reviewers check booking structures
- THEN `reservations` MUST represent the booking/commercial header with planned date range and primary guest/contact
- AND `reservation_items` MUST represent each requested room or room category inside a reservation
- AND a grouped reservation such as two double rooms and one single room MUST be representable as one `reservation` with multiple `reservation_items`

#### Scenario: Reservation items support category-level assignment

- GIVEN `reservation_items` is inspected
- WHEN its room references are reviewed
- THEN `room_type_id` MUST be present
- AND `room_id` MUST be nullable so a concrete room can be assigned later
- AND when `room_id` is assigned, the schema or later service rules MUST keep it consistent with the item's room type and property

#### Scenario: Stays represent actual occupation

- GIVEN the stay schema is inspected
- WHEN reviewers check actual occupancy structures
- THEN `stays` MUST represent real room occupation
- AND `stays` MUST reference a concrete `room_id`
- AND `stays` MUST allow nullable `reservation_item_id` so walk-in stays can exist without a prior reservation

#### Scenario: Stay guests capture real occupants

- GIVEN a stay has one or more occupants
- WHEN the schema records those occupants
- THEN `stay_guests` MUST link `stays` to `guests`
- AND it MUST allow the reservation contact/customer to differ from the people who actually occupy the room

### Requirement: Availability Concepts

The schema MUST define the status fields needed for future availability validation without implementing the full overlap-prevention workflow in this change.

#### Scenario: Confirmed reservation items block future availability conceptually

- GIVEN a reservation item exists for a planned date range
- WHEN its status is `confirmed`
- THEN the schema MUST provide the status and date relationships needed for later availability logic to treat it as a future availability blocker
- AND `pending`, `cancelled`, and `no_show` reservation items MUST NOT be defined as guaranteed inventory blockers

#### Scenario: Active stays block actual occupancy conceptually

- GIVEN a stay exists for a room
- WHEN its status is `active`
- THEN the schema MUST provide the status and room relationship needed for later availability logic to treat it as actual occupancy

#### Scenario: Advanced overlap enforcement remains deferred

- GIVEN issue #6 is implemented
- WHEN reviewers inspect SQL and tests
- THEN the change MUST NOT be required to implement transaction-safe overlap prevention, exclusion constraints, or advanced availability triggers
- AND those enforcement details MUST remain available for issue #15

### Requirement: Operations Schema

The schema MUST support the base operational records for housekeeping and maintenance without implementing workflow automation.

#### Scenario: Housekeeping tasks can be tied to rooms and stays

- GIVEN the `housekeeping_tasks` table is inspected
- WHEN reviewers check its relationships
- THEN it MUST reference a property and room
- AND it MAY reference a stay
- AND it MAY reference an assigned profile
- AND it MUST use status and priority fields based on the approved enums

#### Scenario: Maintenance tickets can block availability conceptually

- GIVEN the `maintenance_tickets` table is inspected
- WHEN reviewers check its availability fields
- THEN it MUST reference a property and room
- AND it MUST include `blocks_availability`
- AND it MAY reference reporting and assigned profiles
- AND it MUST use status and priority fields based on the approved enums

### Requirement: Billing and Manual Payments Schema

The schema MUST support invoices and manual payments without introducing payment-gateway behavior.

#### Scenario: Invoices support deposits, stays, and manual guest charges

- GIVEN the `invoices` table is inspected
- WHEN reviewers check its optional references
- THEN it MUST allow relationships to `guests`, `reservations`, and `stays` as needed for reservation deposits, stay invoices, or manual guest charges
- AND it MUST require enough information to identify the invoice, currency, status, and monetary totals

#### Scenario: Payments are manual records only

- GIVEN the `payments` table is inspected
- WHEN reviewers check its fields and enums
- THEN payments MUST reference invoices
- AND payments MUST support manual methods such as `cash`, `card`, `bank_transfer`, and `other`
- AND the schema MUST NOT introduce payment gateway tokens, provider charge IDs, webhook secrets, or gateway-specific payment lifecycle fields

### Requirement: Migration TDD and Validation

The implementation MUST satisfy strict TDD by validating the migration artifact through repository tests or validators before remote application is considered complete.

#### Scenario: Repository validation runs through npm test command

- GIVEN issue #6 is applied
- WHEN validation is run
- THEN migration tests or validators MUST execute under `npm run test:run`
- AND those checks MUST verify the presence of critical enums, tables, fields, and prohibited schema drift such as `rooms.state = reserved`, `room_types.quantity`, or gateway payment fields

#### Scenario: TDD evidence is recorded

- GIVEN strict TDD is enabled in `openspec/config.yaml`
- WHEN apply evidence is written
- THEN it MUST show a RED/GREEN or equivalent validator-first sequence for the migration checks
- AND InsForge remote validation MUST NOT be used as the only substitute for repository-level tests

### Requirement: InsForge Application and Evidence

The migration MUST be applicable to the selected InsForge/PostgreSQL backend and remote validation evidence MUST be captured after application.

#### Scenario: Migration is applied to InsForge after repository validation

- GIVEN the repository migration and tests are complete
- WHEN the schema is applied remotely
- THEN it MUST be applied to the InsForge/PostgreSQL backend selected for InnHub
- AND the application method MUST be recorded in apply or verify evidence

#### Scenario: Remote schema is validated after application

- GIVEN the migration has been applied to InsForge
- WHEN reviewers inspect validation evidence
- THEN the evidence MUST confirm required tables, enums, and key relationships exist remotely
- AND the evidence MUST identify any InsForge capability limitation or schema deviation found during application

### Requirement: Scope Boundaries

The change MUST remain limited to the schema foundation and validation evidence for issue #6.

#### Scenario: Feature implementation is not introduced

- GIVEN reviewers inspect the issue #6 change
- WHEN they check repository and remote backend changes
- THEN the change MUST NOT add seed/demo data, frontend CRUD screens, frontend service-layer feature APIs, auth UI/session behavior, check-in/check-out automation, dashboard/report persistence, or payment gateway integration

#### Scenario: Later issues retain workflow ownership

- GIVEN the schema supports future MVP workflows
- WHEN issue #6 is accepted
- THEN auth behavior MUST remain for issue #5
- AND property access enforcement MUST remain for issue #7 except for structural schema preparation
- AND seed data MUST remain for issue #8
- AND service layer and CRUD behavior MUST remain for issues #9 through #14 and #20
- AND overlap prevention implementation MUST remain for issue #15
- AND check-in/check-out, housekeeping workflow automation, maintenance resolution, and dashboard/report behavior MUST remain for issues #16 through #21

## Acceptance Criteria

- A versioned SQL migration exists in the repository for the core InnHub schema.
- The migration defines the required PostgreSQL native enums and core tables.
- Operational tables include `property_id` and relationships needed for property-scoped validation.
- `profiles` uses an internal `id` plus unique `auth_user_id`.
- `room_types` has no `quantity` or stored inventory count.
- `rooms` uses `identifier` and does not support a physical `reserved` state.
- `reservations`, `reservation_items`, `stays`, and `stay_guests` remain distinct structures.
- `reservation_items.status = confirmed` and `stays.status = active` are available as conceptual availability blockers.
- Billing supports invoices and manual payments without payment-gateway fields.
- Migration tests or validators run through `npm run test:run` during apply.
- The migration is applied to InsForge/PostgreSQL and remote schema validation evidence is recorded.
- Seed data, auth UI/session behavior, frontend services/CRUD, advanced overlap prevention, check-in/out automation, dashboard/report persistence, and payment gateway behavior remain out of scope.
