# Delta for room-types

## ADDED Requirements

### Requirement: Soft Delete Service

The system MUST provide `softDelete(session, id)` setting `deleted_at = NOW()`, scoped to session property, gated to manager+ roles.

#### Scenario: Soft delete succeeds

- GIVEN an authorized user and an active room type
- WHEN softDelete is called
- THEN `deleted_at` MUST be set, success returned

#### Scenario: Unauthorized rejected

- GIVEN a receptionist user
- WHEN they call softDelete
- THEN `validation-error` / `permission-denied` is returned

#### Scenario: Update on deleted returns not-found

- GIVEN a room type with `deleted_at` set
- WHEN update is attempted
- THEN the service returns `not-found`

### Requirement: Remove Hook

The hook MUST expose `remove(id)` calling softDelete, refreshing on success, with stale-request protection.

#### Scenario: Remove succeeds

- GIVEN hook in loaded state
- WHEN remove(id) succeeds
- THEN list refreshes, deleted type absent

#### Scenario: Remove fails

- GIVEN softDelete fails
- WHEN remove(id) is called
- THEN hook throws error, no refresh

#### Scenario: Stale remove after session change

- GIVEN remove in flight and session changes
- WHEN it resolves
- THEN state NOT updated with stale data

### Requirement: Delete UI

The UI MUST show a delete button per row for manager+, with a confirmation modal.

#### Scenario: Visible for manager+

- GIVEN admin or manager user
- WHEN list renders
- THEN each row shows a delete button

#### Scenario: Hidden for receptionist

- GIVEN receptionist user
- WHEN list renders
- THEN delete buttons absent

#### Scenario: Confirmation modal

- GIVEN user clicks delete
- WHEN modal opens
- THEN confirm executes deletion, cancel dismisses

## MODIFIED Requirements

### Requirement: List Room Types

The system MUST display room types for the active property, excluding soft-deleted records.

(Previously: returned all records)

#### Scenario: List filtered by deleted_at IS NULL

- GIVEN authenticated user with valid session
- WHEN navigating to room types
- THEN records filtered by property_id AND `deleted_at IS NULL`

#### Scenario: Empty state

- GIVEN no active room types exist
- WHEN list loads
- THEN empty state renders

#### Scenario: Error state

- GIVEN backend request fails
- WHEN list loads
- THEN safe error state renders

### Requirement: Create Room Type

The system MUST enforce UNIQUE(property_id, name) only among active records.

(Previously: unique constraint was absolute)

#### Scenario: Create succeeds

- GIVEN authorized user, valid data
- WHEN submitted
- THEN record persists and appears in list

#### Scenario: Duplicate active name rejected

- GIVEN active room type with same name
- WHEN submitted
- THEN "name already exists" error shown

#### Scenario: Duplicate name allowed after soft delete

- GIVEN only a soft-deleted record had the name
- WHEN submitted
- THEN new record is created

#### Scenario: Unauthorized user

- GIVEN receptionist user
- WHEN list renders
- THEN create button hidden

### Requirement: Edit Room Type

The system MUST allow edits but reject mutations on soft-deleted records.

(Previously: no soft-delete guard)

#### Scenario: Edit succeeds

- GIVEN authorized user, valid data
- WHEN submitted
- THEN record updates, list reflects changes

#### Scenario: Edit on deleted returns not-found

- GIVEN a soft-deleted room type
- WHEN edit attempted
- THEN `not-found` returned

#### Scenario: Not-found ID handled

- GIVEN room type ID does not exist
- WHEN navigating to edit
- THEN not-found error renders
