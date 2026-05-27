# User Profile Specification

## Purpose

View the authenticated user's profile (fullName, email, role, resolved property name). Read-only for all roles. Administrator can edit fullName using a read/edit toggle pattern with React Hook Form + Zod validation.

## Requirements

### Requirement: Profile Data Display

The system MUST display the authenticated user's fullName, email, role, and resolved property name when the user navigates to the profile page.

#### Scenario: Read view renders user profile data

- GIVEN an authenticated user with a valid session
- WHEN the user navigates to the profile route
- THEN the system MUST display fullName, email, and role from the session
- AND it MUST resolve and display the property name from the session propertyId

#### Scenario: Property name resolution fallback

- GIVEN the authenticated session has a valid propertyId
- WHEN the property name service fails or returns no result
- THEN the system MUST display the raw propertyId as fallback
- AND it MUST NOT show a generic error in place of the profile

### Requirement: Read-Only Default Mode

The system MUST render all profile fields in read-only mode by default, regardless of role.

#### Scenario: Default state is read-only

- GIVEN any authenticated user views the profile page
- WHEN the page renders
- THEN all fields MUST display as read-only text, not form inputs
- AND no changes MUST be persisted until edit mode is explicitly activated by an administrator

### Requirement: Admin Edit Profile Name

An administrator MUST be able to toggle edit mode and update their fullName, following the read/edit pattern from PropertyProfilePage.

#### Scenario: Admin toggles edit mode and updates name

- GIVEN an authenticated user with administrator role on the profile page in read mode
- WHEN the user clicks the edit button, modifies fullName, and submits the form
- THEN the system MUST validate the input (non-empty, max length)
- AND it MUST persist the update through the profile service
- AND the page MUST return to read mode reflecting the updated fullName

#### Scenario: Validation prevents empty name

- GIVEN the edit form is active
- WHEN the user submits an empty or whitespace-only fullName
- THEN the system MUST show inline validation errors
- AND it MUST NOT submit the data to the service
- AND the form MUST remain in edit mode

#### Scenario: Backend failure preserves edit state

- GIVEN the user submits a valid fullName
- WHEN the profile service returns a failure
- THEN the system MUST show an error message without exposing raw backend payloads
- AND the form MUST remain in edit mode preserving unsaved input

### Requirement: Non-Admin Read-Only Restriction

Non-administrator roles MUST NOT see an edit button or be able to activate edit mode.

#### Scenario: Non-admin sees no edit controls

- GIVEN an authenticated user with role receptionist, housekeeping, or maintenance
- WHEN the profile page renders
- THEN the system MUST NOT render any edit button, toggle, or actionable control
- AND the page MUST remain in read-only mode only

#### Scenario: Direct edit attempt is denied

- GIVEN a non-administrator user
- WHEN the user attempts to submit a profile update or activate edit mode via URL
- THEN the system MUST deny the mutation
- AND it MUST return to read-only display state

## Acceptance Criteria

- Profile page renders fullName, email, role, and property name for all authenticated roles.
- Default state is read-only with no form inputs visible.
- Administrator can toggle edit mode and persist fullName changes with validation.
- Non-admin roles see no edit controls.
- Property name resolves from session propertyId with fallback to raw propertyId.
- Backend failures surface safely without exposing raw errors.
- `npm run test:run` passes with tests for view, admin edit, non-admin restriction, and property name resolution.
