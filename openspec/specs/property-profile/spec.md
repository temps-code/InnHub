# Property Profile Specification

## Purpose

Define viewing and editing behavior for current property settings — name, business_type, timezone, currency, address, phone, email — keeping immutable fields (id, slug, created_at, updated_at) read-only and enforcing session-derived scope.

## Requirements

### Requirement: View Current Property Profile

The system MUST present a read-only view of the current property's settings when the user navigates to the property profile page, using the authenticated session `property_id` to load the data.

#### Scenario: Read view renders property settings

- GIVEN an authenticated user with a valid session property context
- WHEN the user navigates to the property profile route
- THEN the system MUST load the current property record using the session `property_id`
- AND it MUST display writable fields (name, business_type, timezone, currency, address, phone, email) and read-only fields (id, slug, created_at, updated_at)

#### Scenario: Missing or invalid property is handled gracefully

- GIVEN an authenticated user whose session has no valid property
- WHEN the property profile page loads
- THEN the system MUST show a safe not-found or error state
- AND it MUST NOT render partial or unchecked property data

### Requirement: Edit Property Profile Settings

The system MUST allow switching to an edit form for writable fields, validating input, and persisting changes through the service boundary, keeping read-only fields visually present but immutable.

#### Scenario: User updates writable fields successfully

- GIVEN the property profile page is in read mode
- WHEN the user activates edit mode, modifies one or more writable fields, and submits the form
- THEN the system MUST validate the input against the expected types
- AND it MUST persist the changes through the property service
- AND the page MUST return to read mode reflecting the updated data

#### Scenario: Validation prevents invalid input

- GIVEN the edit form is active
- WHEN the user submits data that fails validation (e.g., invalid email, missing required field)
- THEN the system MUST show inline validation errors
- AND it MUST NOT submit the data to the service
- AND the form MUST remain in edit mode so the user can correct errors

#### Scenario: Backend update failure is surfaced safely

- GIVEN the user submits valid form data
- WHEN the property service returns a failure
- THEN the system MUST show an error message without exposing raw backend payloads
- AND the form MUST remain in edit mode preserving the user's unsaved input

### Requirement: Session-Derived Property Scope

The system MUST derive the target property from the authenticated session and MUST NOT allow the user to select, submit, or mutate a different property through the UI.

#### Scenario: Reads use current session property

- GIVEN an authenticated session with exactly one `property_id`
- WHEN the property profile service reads the current property
- THEN the service MUST use the session `property_id` to scope the read operation
- AND it MUST NOT accept a property ID from URL params, form input, or any UI source

#### Scenario: Updates enforce same session property

- GIVEN the user submits property profile edits
- WHEN the property service persists the update
- THEN the service MUST scope the mutation to the session `property_id`
- AND it MUST reject any attempt to write to a different property record

## Acceptance Criteria

- Read-only property profile renders writable and read-only fields from the current session property.
- Missing or invalid property context produces a safe error state instead of partial data.
- Edit mode validates input, persists valid changes through the service boundary, and handles backend failures safely.
- Read-only fields (id, slug, created_at, updated_at) are visible but not editable in edit mode.
- Reads and updates are scoped to the authenticated session `property_id`; no UI-supplied property ID is trusted.
- `npm run test:run` passes with tests for view, edit, validation, error handling, and scope enforcement.
