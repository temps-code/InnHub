# Delta for database-schema

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Core Tables

The migration MUST create the core tables needed by the InnHub MVP schema foundation.

(Previously: timestamps only mention `created_at` and `updated_at`)

#### Scenario: Required tables are created

- GIVEN reviewers inspect the migration or validated remote schema
- WHEN they list the core tables
- THEN the schema MUST include `properties`, `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, and `payments`

#### Scenario: Tables have foundational identifiers and timestamps

- GIVEN a core mutable table is inspected
- WHEN its columns are reviewed
- THEN it MUST have a primary key suitable for repository and InsForge validation
- AND it SHOULD include `created_at`, `updated_at`, and `deleted_at` (for soft-delete support) unless design documents a justified exception

### Requirement: Inventory Schema

The schema MUST represent room categories and physical rooms according to the approved ERD decisions.

(Previously: unique constraints were always absolute)

#### Scenario: Rooms use flexible identifiers

- GIVEN the `rooms` table is inspected
- WHEN reviewers check room identification
- THEN `rooms` MUST use `identifier` for user-facing room labels
- AND `identifier` MUST allow non-numeric labels such as `A1` or `PB-03`
- AND the schema MUST enforce uniqueness of active room identifiers per property via a partial index `WHERE deleted_at IS NULL`
