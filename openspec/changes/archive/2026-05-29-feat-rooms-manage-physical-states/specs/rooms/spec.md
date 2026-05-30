# Rooms Specification

## Purpose

Define CRUD UI for rooms with physical state management, scoped to the active property. Rooms link to room types via FK and enforce identifier uniqueness per property. Physical states: available, occupied, cleaning, maintenance, inactive.

## Requirements

### Requirement: Types and Schema Validation

The system MUST define a `Room` type with id, property_id, room_type_id, identifier, floor, state, description, created_at, updated_at, deleted_at. A `roomFormSchema` (zod) MUST validate: identifier (required, non-empty string), room_type_id (required, UUID), floor (optional string), state (required, enum), description (optional string).

#### Scenario: Valid form data passes validation

- GIVEN a user fills the room form with valid identifier, room_type_id, and state
- WHEN the form is submitted
- THEN zod validation passes and the service is called

#### Scenario: Missing required fields rejected

- GIVEN a user leaves identifier or room_type_id empty
- WHEN the form is submitted
- THEN zod returns field-level errors and the service is NOT called

### Requirement: List Rooms with Filters

The system MUST load rooms for the active property, excluding soft-deleted records, supporting filters: status (state enum), room_type_id, and text search across identifier AND description. Accessible to users with role score ≥60.

#### Scenario: List renders from backend

- GIVEN an authenticated user with a valid session property
- WHEN the user navigates to the rooms route
- THEN the system loads rooms filtered by session property_id AND `deleted_at IS NULL`
- AND displays identifier, room type name, floor, state badge, description

#### Scenario: Status filter narrows results

- GIVEN active rooms with mixed states exist
- WHEN user selects "available" from status filter
- THEN only rooms with state=available are displayed

#### Scenario: Room type filter narrows results

- GIVEN active rooms with multiple room types exist
- WHEN user selects a specific room type from the dropdown
- THEN only rooms matching that room_type_id are displayed

#### Scenario: Text search matches identifier and description

- GIVEN rooms with identifiers "101", "102" and descriptions "Ocean view", "Garden view"
- WHEN user types "ocean" in search
- THEN rooms with "ocean" in identifier OR description are displayed

#### Scenario: Empty state renders

- GIVEN the active property has no rooms
- WHEN the list loads
- THEN an empty state message is rendered

#### Scenario: Error state renders safely

- GIVEN the backend request fails
- WHEN the list attempts to load
- THEN a safe error state renders without exposing SDK errors

### Requirement: Create Room

The system MUST allow administrator, manager, and receptionist roles to create rooms. The service MUST enforce UNIQUE(property_id, identifier) among active records via DB partial index.

#### Scenario: Create succeeds

- GIVEN an authorized user submits valid form data
- WHEN the service persists the record
- THEN the new room appears in the list

#### Scenario: Duplicate identifier rejected

- GIVEN an active room with identifier "101" exists for the property
- WHEN user creates a room with identifier "101"
- THEN a validation error is shown and no duplicate is created

#### Scenario: Room type FK loads from service

- GIVEN room types exist for the active property
- WHEN the create form opens
- THEN a select dropdown populated with room types from `roomTypeService.list` is displayed

### Requirement: Edit Room

The system MUST allow authorized users to edit identifier, room_type_id, floor, state, and description. The room_type_id MAY be changed. Edits on soft-deleted records return not-found.

#### Scenario: Edit succeeds

- GIVEN an authorized user modifies room fields
- WHEN the form is submitted
- THEN the record updates and list reflects changes

#### Scenario: Edit on deleted returns not-found

- GIVEN a soft-deleted room
- WHEN edit is attempted
- THEN the system shows a not-found error state

### Requirement: Physical State Management

The system MUST allow administrator, manager, and receptionist roles to change room state to any valid value (available, occupied, cleaning, maintenance, inactive). No state machine — any state transitions to any other.

#### Scenario: State change succeeds

- GIVEN a room in state "available"
- WHEN an authorized user changes state to "occupied"
- THEN the room's state updates and the badge reflects the new state

#### Scenario: Unauthorized user cannot change state

- GIVEN a user with role score below required threshold
- WHEN they attempt to change room state
- THEN the action is rejected

### Requirement: Status Badge

The system MUST render a `StatusBadge` component for each room state: available→success tone, occupied→info tone, cleaning→warning tone, maintenance→danger tone, inactive→neutral tone.

#### Scenario: Badge renders correct tone

- GIVEN a room with state "maintenance"
- WHEN the row renders
- THEN a danger-toned badge with text "maintenance" is displayed

### Requirement: Soft Delete Room

The system MUST provide `softDelete(session, id)` setting `deleted_at = NOW()`, scoped to session property, gated to manager+ roles. Soft delete MUST be blocked if the room has active or future reservations (status IN ('confirmed','checked_in') AND check_out > NOW()).

#### Scenario: Soft delete succeeds

- GIVEN an authorized manager and an active room with no active reservations
- WHEN softDelete is called
- THEN `deleted_at` is set and the room is removed from the list

#### Scenario: Soft delete blocked by active reservation

- GIVEN a room has a reservation with status='confirmed' and check_out in the future
- WHEN softDelete is called
- THEN the service returns an error indicating active reservations block deletion

#### Scenario: Unauthorized user rejected

- GIVEN a receptionist user
- WHEN they call softDelete
- THEN a permission-denied error is returned

### Requirement: Delete UI

The UI MUST show a delete button per row for manager+ roles, with a `ConfirmDialog` modal. The confirmation message MUST warn about active reservation block.

#### Scenario: Delete visible for manager+

- GIVEN admin or manager user
- WHEN list renders
- THEN each row shows a delete button

#### Scenario: Delete hidden for receptionist

- GIVEN receptionist user
- WHEN list renders
- THEN delete buttons are absent

#### Scenario: Confirmation modal

- GIVEN user clicks delete
- WHEN ConfirmDialog opens
- THEN confirm executes deletion, cancel dismisses

### Requirement: Hook State Management

The `useRooms` hook MUST manage rooms list state, loading, error, and filter state. It MUST expose `create`, `update`, `remove` methods. It MUST load room types on mount for FK select. It MUST handle stale-request protection on session change.

#### Scenario: Hook loads rooms on mount

- GIVEN the hook is initialized
- WHEN mount completes
- THEN rooms list is populated, loading=false

#### Scenario: Filter state updates trigger re-render

- GIVEN rooms are loaded
- WHEN user changes status filter
- THEN filtered rooms are displayed without re-fetching

#### Scenario: Stale request after session change

- GIVEN a create request is in flight
- WHEN session property changes before resolution
- THEN the stale response does NOT overwrite current state

### Requirement: Session-Derived Property Scope

Every operation MUST derive the target property from the authenticated session, not from URL params or form input.

#### Scenario: Reads scope by session property

- GIVEN an authenticated session with property_id
- WHEN the room service reads records
- THEN it filters by session property_id

#### Scenario: Writes assign session property

- GIVEN an authorized user creates or edits a room
- WHEN the service persists the record
- THEN it associates the record with session property_id

### Requirement: i18n Keys

The system MUST provide i18n keys in English and Spanish for: page title, table headers (identifier, type, floor, state, description), filter labels, form labels, status badge text, empty/error states, confirmation messages, and validation errors.

#### Scenario: English keys present

- GIVEN the app renders in English
- WHEN the rooms page loads
- THEN all UI text is resolved from i18n keys

#### Scenario: Spanish keys present

- GIVEN the app renders in Spanish
- WHEN the rooms page loads
- THEN all UI text resolves to Spanish translations

## Technical Decisions

### SDK Limitation: `.neq(column, null)` not supported

**Context:** InsForge SDK wraps Supabase PostgREST. The `.neq()` operator is for value comparisons only, not null checks.

**Decision:** `listArchived` uses post-filter — fetch all rooms for property, then filter in JavaScript: `data.filter(r => r.deleted_at !== null)`.

**Trade-off:** Full-table scan. Acceptable for MVP with bounded data volumes.

### Soft Delete Reservation Check

**Context:** Room soft delete must be blocked when active/future reservations exist.

**Decision:** Query reservations table for `status IN ('confirmed','checked_in') AND check_out > NOW()` referencing the room before allowing soft delete. Return `validation-error` with reservation count if blocked.

### Client-Side Search

**Context:** Text search across identifier and description.

**Decision:** Filter client-side after loading all rooms for the property. Acceptable for MVP scale. Server-side search can be added later if record counts grow.

## Acceptance Criteria

- Room list renders for active property with loading, empty, and error states.
- Create/edit forms validate input, enforce identifier uniqueness, handle backend errors safely.
- Room type FK select loads available room types from roomTypeService.
- Status filter, room type filter, and text search work correctly.
- StatusBadge renders correct tones for each physical state.
- Soft delete gated to manager+ with ConfirmDialog modal.
- Soft delete blocked when room has active/future reservations.
- Identifier uniqueness enforced (duplicate rejected with error).
- All operations scoped to session property_id via shared helpers.
- i18n keys present for English and Spanish.
- Tests pass for service, hook, and page.
