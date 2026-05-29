# Delta for Room Types

## ADDED Requirements

### Requirement: List Archived Room Types

The system MUST provide `listArchived(session)` returning room types WHERE `deleted_at IS NOT NULL`, scoped to session property, gated to manager+ roles (score ≥80).

#### Scenario: Archived list loads for active property

- GIVEN an authenticated manager/admin with a valid session property context
- WHEN listArchived is called
- THEN it MUST return room types filtered by session property_id AND `deleted_at IS NOT NULL`

#### Scenario: Archived list excludes active records

- GIVEN the active property has both active and soft-deleted room types
- WHEN listArchived is called
- THEN the result MUST NOT contain any record where `deleted_at IS NULL`

#### Scenario: Archived list scoped by property

- GIVEN two properties each have soft-deleted room types
- WHEN listArchived is called with session property A
- THEN only property A's archived records MUST be returned

#### Scenario: Unauthorized rejected

- GIVEN a receptionist user (score < 80)
- WHEN they call listArchived
- THEN `permission-denied` MUST be returned

### Requirement: Restore Room Type

The system MUST provide `restore(session, id)` setting `deleted_at = NULL`, rejecting if a duplicate active name exists, scoped to session property, gated to manager+.

#### Scenario: Restore succeeds

- GIVEN a soft-deleted room type with no active name conflict
- WHEN restore is called
- THEN `deleted_at` MUST be set to NULL and the record returned

#### Scenario: Restore rejects duplicate active name

- GIVEN a soft-deleted room type "Standard Queen" AND an active room type "Standard Queen" in the same property
- WHEN restore is called on the soft-deleted record
- THEN `validation-error` with message about duplicate name MUST be returned
- AND `deleted_at` MUST remain set

#### Scenario: Restore rejects non-deleted record

- GIVEN an active room type (deleted_at IS NULL)
- WHEN restore is called
- THEN `not-found` MUST be returned

#### Scenario: Restore scoped by property

- GIVEN a soft-deleted room type belonging to property A
- WHEN restore is called with session property B
- THEN `not-found` MUST be returned

#### Scenario: Restore requires manager+ role

- GIVEN a receptionist user
- WHEN they call restore
- THEN `permission-denied` MUST be returned

### Requirement: Purge Room Type

The system MUST provide `purge(session, id)` performing physical DELETE after checking foreign key references in `rooms` and `reservation_items`, scoped to session property, gated to manager+.

#### Scenario: Purge succeeds with no references

- GIVEN a soft-deleted room type with no rows in `rooms` or `reservation_items`
- WHEN purge is called
- THEN the record MUST be physically deleted

#### Scenario: Purge rejected when rooms reference type

- GIVEN a soft-deleted room type referenced by rows in `rooms`
- WHEN purge is called
- THEN `foreign-key-conflict` MUST be returned with a message listing the blocking reference count

#### Scenario: Purge rejected when reservation_items reference type

- GIVEN a soft-deleted room type referenced by rows in `reservation_items`
- WHEN purge is called
- THEN `foreign-key-conflict` MUST be returned

#### Scenario: Purge rejected when both tables reference type

- GIVEN a soft-deleted room type referenced by both `rooms` and `reservation_items`
- WHEN purge is called
- THEN `foreign-key-conflict` MUST be returned

#### Scenario: Purge rejects non-deleted record

- GIVEN an active room type
- WHEN purge is called
- THEN `not-found` MUST be returned

#### Scenario: Purge scoped by property

- GIVEN a soft-deleted room type belonging to property A
- WHEN purge is called with session property B
- THEN `not-found` MUST be returned

#### Scenario: Purge requires manager+ role

- GIVEN a receptionist user
- WHEN they call purge
- THEN `permission-denied` MUST be returned

## MODIFIED Requirements

### Requirement: List Room Types

The system MUST display room types for the active property, excluding soft-deleted records, accessible to users with role score ≥60, with loading, empty, and error states.
(Previously: list-only, no archive view)

#### Scenario: List renders from backend

- GIVEN an authenticated user with a valid session property context
- WHEN the user navigates to the room types route
- THEN the system MUST load room types filtered by session property_id AND `deleted_at IS NULL`
- AND display name, capacity, base_price, and description for each row

#### Scenario: Empty state renders

- GIVEN the active property has no room types
- WHEN the list loads
- THEN the system MUST render an empty state message
- AND NOT render a broken or blank table

#### Scenario: Error state renders safely

- GIVEN the backend request fails
- WHEN the list attempts to load
- THEN the system MUST render a safe error state
- AND NOT expose raw SDK error messages or tokens

### Requirement: Remove Hook

The hook MUST expose `remove(id)` calling softDelete, refreshing on success, with stale-request protection.
(Previously: remove only, no archive toggle or restore/purge methods)

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
(Previously: delete only, no archive toggle or restore/purge actions)

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

## ADDED Requirements

### Requirement: Archive Toggle Hook State

The hook MUST expose `showArchived: boolean` toggle state and `toggleArchived()` method, switching between `list` and `listArchived` queries when toggled.

#### Scenario: Toggle switches to archived view

- GIVEN hook in loaded state with active room types
- WHEN toggleArchived() is called
- THEN `showArchived` becomes true AND `listArchived` is called
- AND `state.roomTypes` contains only soft-deleted records

#### Scenario: Toggle switches back to active view

- GIVEN hook with `showArchived = true`
- WHEN toggleArchived() is called
- THEN `showArchived` becomes false AND `list` is called
- AND `state.roomTypes` contains only active records

#### Scenario: Refresh respects current mode

- GIVEN hook with `showArchived = true`
- WHEN refresh() is called
- THEN `listArchived` is called (not `list`)

### Requirement: Restore and Purge Hook Methods

The hook MUST expose `restore(id)` and `purge(id)` methods that call the corresponding service functions, refresh the current view on success, and throw on failure.

#### Scenario: Restore refreshes archived view

- GIVEN hook with `showArchived = true`
- WHEN restore(id) succeeds
- THEN the archived list refreshes and the restored record is absent

#### Scenario: Purge refreshes archived view

- GIVEN hook with `showArchived = true`
- WHEN purge(id) succeeds
- THEN the archived list refreshes and the purged record is absent

#### Scenario: Restore failure throws

- GIVEN restore service returns an error
- WHEN restore(id) is called
- THEN the hook MUST throw the error AND NOT refresh

#### Scenario: Purge failure throws

- GIVEN purge service returns an error
- WHEN purge(id) is called
- THEN the hook MUST throw the error AND NOT refresh

### Requirement: Archive Toggle UI

The UI MUST show a "View Recycle Bin" toggle button for admin/manager users, switching between active and archived room type lists.

#### Scenario: Toggle visible for manager+

- GIVEN admin or manager user
- WHEN room types page renders
- THEN a toggle button for archive view is visible

#### Scenario: Toggle hidden for receptionist

- GIVEN receptionist user
- WHEN room types page renders
- THEN the archive toggle is hidden

#### Scenario: Toggle switches table content

- GIVEN user clicks the archive toggle
- WHEN the toggle activates
- THEN the table displays archived room types with restore and purge action buttons

### Requirement: Archived Room Types Table

The UI MUST render an archived room types table showing name, capacity, base_price, description, and deleted_at, with restore and purge buttons per row.

#### Scenario: Archived table renders data

- GIVEN archived room types exist for the active property
- WHEN the archive view is active
- THEN the table MUST display name, capacity, base_price, description, and deleted_at for each row

#### Scenario: Empty archived state

- GIVEN no soft-deleted room types exist
- WHEN the archive view is active
- THEN an empty state message "No archived room types" MUST render

#### Scenario: Restore button triggers confirmation

- GIVEN user clicks Restore on an archived row
- WHEN the confirmation dialog opens
- THEN it MUST show a restore confirmation message
- AND confirm restores the record, cancel dismisses

#### Scenario: Purge button triggers danger confirmation

- GIVEN user clicks Purge on an archived row
- WHEN the danger confirmation dialog opens
- THEN it MUST show an irreversible warning
- AND confirm purges the record, cancel dismisses

#### Scenario: Purge constraint violation alert

- GIVEN purge fails with `foreign-key-conflict`
- WHEN the error surfaces in the UI
- THEN a user-friendly alert MUST display explaining references block deletion

#### Scenario: Restore duplicate name error

- GIVEN restore fails with duplicate name conflict
- WHEN the error surfaces in the UI
- THEN a user-friendly error MUST display explaining the name conflict

## Acceptance Criteria

- Archived list loads with correct property scoping and role gating.
- Restore succeeds and record reappears in active list; duplicate name is rejected.
- Purge succeeds when no FK references; rejected with `foreign-key-conflict` when references exist.
- Toggle visible only for admin/manager; switches between active and archived views.
- Confirmation dialogs for restore and purge work correctly.
- All operations scoped to session property_id.
- Tests pass via `npm run test:run`.
