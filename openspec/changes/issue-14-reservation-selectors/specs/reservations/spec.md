# Reservations Selector UX Specification

## Purpose

Define the required behavior for replacing raw reservation create/edit ID fields with user-facing selectors for guests, room types, and optional rooms, while preserving the existing reservation service and issue #15 availability validation as the authoritative validation path.

## Requirements

### Requirement: Guest Selection Replaces Raw Guest ID Input

The reservation create/edit form MUST allow users to search and select an existing property-scoped guest instead of typing a raw guest ID.

#### Scenario: Select existing guest

- GIVEN the reservation form is open
- WHEN the user searches for an existing guest
- THEN matching property-scoped guests MUST be available for selection
- AND selecting a guest MUST populate the form’s `primary_guest_id` payload value
- AND the raw `primary_guest_id` text input MUST NOT be shown as the primary UX

#### Scenario: Guest selection is required

- GIVEN no primary guest is selected
- WHEN the user submits the reservation form
- THEN the form or service MUST reject submission with a clear validation message
- AND no partial reservation MUST be created

### Requirement: Guest Quick-Create Uses Existing Guest Service Rules

The reservation form MUST support minimal guest quick-create and MUST reuse existing guest service requirements rather than inventing a temporary guest policy.

#### Scenario: Quick-create guest from reservation form

- GIVEN the desired guest does not exist
- WHEN the user enters the required quick-create guest fields and submits quick-create
- THEN the system MUST create the guest through the existing guest service
- AND the new guest MUST be scoped to the current property
- AND the new guest MUST be automatically selected for the reservation form

#### Scenario: Quick-create validation errors are shown

- GIVEN quick-create input violates existing guest service requirements
- WHEN the user submits quick-create
- THEN the system MUST show the validation error
- AND MUST NOT select a non-created guest
- AND MUST keep the reservation form usable

### Requirement: Active Room Type Selection Replaces Raw Room Type ID Input

The reservation create/edit form MUST allow selecting a room type from active room types instead of typing a raw room type ID.

#### Scenario: Select active room type

- GIVEN active room types exist for the current property
- WHEN the reservation form loads
- THEN the room type control MUST show selectable active room types
- AND selecting a room type MUST populate the form’s `room_type_id` payload value
- AND the raw `room_type_id` text input MUST NOT be shown as the primary UX

#### Scenario: Room type is required

- GIVEN no room type is selected
- WHEN the user submits the reservation form
- THEN the form or service MUST reject submission with a clear validation message
- AND no partial reservation MUST be created

### Requirement: Optional Room Selection Is Filtered By Selected Room Type

The reservation create/edit form MUST offer optional room selection filtered by the selected room type.

#### Scenario: Room choices filter by room type

- GIVEN the user selects a room type
- WHEN room options are displayed
- THEN only rooms belonging to the selected room type MUST be shown
- AND room assignment MAY be left empty

#### Scenario: Room selection clears when room type changes

- GIVEN a room is selected
- WHEN the user changes the room type to one that does not include that room
- THEN the selected room MUST be cleared
- AND the submitted `room_id` MUST be omitted or set to `null`

#### Scenario: Room state may be displayed

- GIVEN room state is available from room data
- WHEN room options are rendered
- THEN the UI MAY display room state
- BUT room state display MUST NOT be treated as authoritative availability validation

### Requirement: Availability Validation Remains Submit-Time Service Authority

The selector UX MUST NOT implement a new availability engine or duplicate issue #15 overlap logic in React components.

#### Scenario: Assigned room conflict is rejected by reservation service

- GIVEN the user selects a room that later conflicts with an existing reservation or blocking condition
- WHEN the user submits the reservation form
- THEN the existing reservation service MUST validate availability through the issue #15 path
- AND any conflict MUST be returned as a submit-time error
- AND the component MUST NOT duplicate overlap predicates

#### Scenario: Unassigned reservation remains valid when other fields pass

- GIVEN primary guest, dates, room type, and guest count are valid
- AND no room is selected
- WHEN the user submits the reservation form
- THEN the reservation MAY be created or updated without room assignment
- AND availability validation MUST NOT require a room assignment

### Requirement: Localized Selector Copy

The reservation selector UX MUST include aligned English and Spanish user-facing copy.

#### Scenario: English and Spanish strings are available

- GIVEN the app locale is English or Spanish
- WHEN the reservation form renders selector and quick-create controls
- THEN labels, placeholders, helper text, validation messages, and action text MUST appear in the selected language
- AND copy MUST avoid raw “ID” wording for normal users

## Acceptance Criteria

- Guest, room type, and room raw ID fields are replaced by selectors in create/edit UX.
- Existing guest search/select works for property-scoped guests.
- Guest quick-create uses existing guest service requirements and auto-selects the created guest.
- Room type choices come from active room types.
- Optional room choices are filtered by selected room type.
- Room assignment remains optional.
- Changing room type clears invalid selected room state.
- Existing reservation service payload contract is preserved.
- Issue #15 submit-time availability validation remains authoritative.
- No new availability engine, UI package, or icon library is introduced.
- EN/ES i18n strings are updated.
- Strict TDD tests cover selector behavior, quick-create, filtering, payload construction, and validation boundaries.
