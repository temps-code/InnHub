# Room Types Specification

## Purpose

Define CRUD UI for room types (e.g., "Standard Queen") scoped to the active property. List/view open to receptionist+ (score ≥60); create/edit restricted to administrator (100) and manager (80).

## Requirements

### Requirement: List Room Types

The system MUST display room types for the active property, accessible to users with role score ≥60, with loading, empty, and error states.

#### Scenario: List renders from backend

- GIVEN an authenticated user with a valid session property context
- WHEN the user navigates to the room types route
- THEN the system MUST load room types filtered by session property_id
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

### Requirement: Create Room Type

The system MUST allow users with score ≥80 to create a room type, enforcing UNIQUE(property_id, name).

#### Scenario: Create succeeds

- GIVEN an authorized user (administrator or manager)
- WHEN the user submits valid form data (name, description, capacity > 0, base_price ≥ 0)
- THEN the system MUST persist the record through the room type service
- AND display the new room type in the list

#### Scenario: Duplicate name is rejected

- GIVEN a room type with the same name already exists for the active property
- WHEN the user submits the create form
- THEN the system MUST show a "name already exists" validation error
- AND NOT create a duplicate record

#### Scenario: Unauthorized user cannot see create button

- GIVEN a user with receptionist role (score < 80)
- WHEN the room types list renders
- THEN the create button MUST be hidden
- AND the user MUST NOT be able to submit a create action

### Requirement: Edit Room Type

The system MUST allow authorized users to edit name, description, capacity, and base_price of an existing room type.

#### Scenario: Edit succeeds

- GIVEN an authorized user views a room type's edit form
- WHEN the user modifies valid fields and submits
- THEN the system MUST update the record through the room type service
- AND reflect the changes in the list view

#### Scenario: Not-found room type is handled

- GIVEN a room type ID that does not exist for the active property
- WHEN the user navigates to its edit form
- THEN the system MUST show a not-found error state
- AND NOT render an empty or broken form

### Requirement: Session-Derived Property Scope

Every operation MUST derive the target property from the authenticated session, not from URL params or form input.

#### Scenario: Reads scope by session property

- GIVEN an authenticated session with property_id
- WHEN the room type service reads records
- THEN it MUST filter by session property_id
- AND NOT accept property_id from UI sources

#### Scenario: Writes assign session property

- GIVEN an authorized user creates or edits a room type
- WHEN the service persists the record
- THEN it MUST associate the record with the session property_id

## Acceptance Criteria

- List renders with loading, empty, and error states for the active property.
- Create/edit buttons gated to administrator/manager roles; hidden for receptionist+.
- Create validates input, enforces UNIQUE(property_id, name), handles backend errors safely.
- Edit updates the record and reflects in list; not-found state renders safely.
- All operations scoped to session property_id via shared helpers.
- `npm run build` passes with no type errors.
