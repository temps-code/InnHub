# Reservations UX Alignment Specification

## Purpose

Define the required UX and service behavior for aligning reservation filters, table display, and create/edit workflows with user-facing hospitality operations and `docs/assets/reservations.png`, while preserving property scoping, service-layer availability authority, EN/ES i18n, and the no-new-UI-library constraint.

## Requirements

### Requirement: Date Filters Have Visible Grouped Labels

Reservation date filters MUST use visible, unambiguous labels grouped by date meaning.

#### Scenario: Check-in date range is visibly labeled

- GIVEN the reservations list is displayed
- WHEN the user views the filter area
- THEN check-in filters MUST be grouped under a visible Check-in label
- AND the two fields MUST be visibly labeled From and To
- AND the labels MUST not rely only on placeholder text or `aria-label`

#### Scenario: Check-out date range is visibly labeled

- GIVEN the reservations list is displayed
- WHEN the user views the filter area
- THEN check-out filters MUST be grouped under a visible Check-out label
- AND the two fields MUST be visibly labeled From and To
- AND the labels MUST not rely only on placeholder text or `aria-label`

### Requirement: Normal Reservation UX Does Not Expose Raw IDs

Normal reservation table and filter UX MUST avoid exposing raw reservation, guest, room, or room type UUIDs/IDs.

#### Scenario: Reservation table avoids raw IDs

- GIVEN reservations are displayed in the table
- WHEN the user views normal table columns
- THEN the table MUST NOT show raw `reservation.id`, `primary_guest_id`, `room_id`, or `room_type_id`
- AND the table MUST show human-readable reservation, guest, room, and room type information instead

#### Scenario: Filters avoid raw ID inputs

- GIVEN the user filters reservations by guest or room
- WHEN the filter controls are displayed
- THEN the controls MUST NOT ask the user to type raw IDs
- AND the controls MUST use human-readable selectors, search controls, or option labels

### Requirement: Guest and Room Filters Are Human-Readable

The reservations list MUST support guest and room filtering through human-readable controls.

#### Scenario: Filter by guest name

- GIVEN property-scoped guests exist
- WHEN the user opens the guest filter
- THEN options MUST be displayed using guest names or clearly identifying human labels
- AND selecting a guest MAY submit the underlying guest ID to the service
- BUT the raw ID MUST NOT be the normal visible label

#### Scenario: Filter by room identifier or type

- GIVEN property-scoped rooms and room types exist
- WHEN the user opens the room filter
- THEN options MUST be displayed using room identifiers and, where available, room type labels
- AND selecting a room MAY submit the underlying room ID to the service
- BUT the raw ID MUST NOT be the normal visible label

### Requirement: Table Displays Human Reservation Information

The reservations table MUST prioritize operationally readable information.

#### Scenario: Reservation reference is shown

- GIVEN a reservation has a reservation reference
- WHEN the row is rendered
- THEN the table MUST show the reservation reference instead of the raw reservation ID

#### Scenario: Guest and room summaries are shown

- GIVEN a reservation has a primary guest and one or more reservation items
- WHEN the row is rendered
- THEN the table MUST show the primary guest name
- AND the table MUST show room identifiers and/or room type labels for the reserved items
- AND multiple items MUST be summarized in a readable way

### Requirement: One Reservation Holder Can Have Multiple Reservation Items

The reservation UX MUST model one primary guest/holder with multiple reserved room items.

#### Scenario: Reservation has one primary guest and multiple items

- GIVEN a user creates or edits a reservation
- WHEN the form is submitted with multiple item rows
- THEN the reservation header MUST contain one primary guest/holder
- AND each reserved room line MUST be represented as a `reservation_item`
- AND each item MUST include room type, optional assigned room, and guest count

### Requirement: Create/Edit Supports Dynamic Reservation Item Rows

The create/edit form MUST allow adding and removing reservation item rows.

#### Scenario: Add item row

- GIVEN the reservation form is open
- WHEN the user adds an item row
- THEN a new row MUST allow selecting a room type
- AND MAY allow selecting a room filtered by that room type
- AND MUST allow entering guest count

#### Scenario: Remove item row

- GIVEN the reservation form has multiple item rows
- WHEN the user removes one item row
- THEN the removed item MUST not be submitted
- AND at least one valid item row MUST remain before submission

#### Scenario: Room options filter by selected room type

- GIVEN an item row has a selected room type
- WHEN the room selector is displayed
- THEN only rooms for that room type MUST be offered
- AND changing the room type MUST clear an incompatible selected room

### Requirement: Availability Validation Remains Service Authority Per Assigned Item

Availability and overlap validation MUST remain authoritative in the reservation service.

#### Scenario: Assigned item conflict is rejected by service

- GIVEN a reservation item has an assigned room
- WHEN create or edit is submitted
- THEN the reservation service MUST validate availability for that assigned item
- AND overlapping active reservations or blocking room conditions MUST be rejected
- AND React components MUST NOT duplicate overlap predicates

#### Scenario: Unassigned item does not require room availability validation

- GIVEN a reservation item has room type and guest count but no assigned room
- WHEN create or edit is submitted
- THEN the reservation MAY remain unassigned if other validation passes
- AND availability validation MUST NOT require a physical room assignment

### Requirement: Reservation Page Aligns More Closely With Prototype Within Budget

The reservations page SHOULD improve alignment with `docs/assets/reservations.png` without exceeding review budget.

#### Scenario: Core prototype alignment is prioritized

- GIVEN the reservations page is implemented
- WHEN the user opens the page
- THEN the page SHOULD prioritize readable filters, status indicators, readable table columns, and clear action placement
- AND optional visual polish MUST be deferred if it threatens the 400-line review budget

### Requirement: EN/ES i18n and Existing UI Stack Are Preserved

All new user-facing reservation copy MUST be localized in English and Spanish, and no new UI library may be introduced.

#### Scenario: Localized copy exists

- GIVEN the app locale is English or Spanish
- WHEN reservation filters, table labels, item rows, validation messages, and actions are rendered
- THEN copy MUST be available in the selected language
- AND copy MUST avoid raw “ID” wording for normal users

#### Scenario: No new UI libraries

- GIVEN this change is implemented
- WHEN dependencies are reviewed
- THEN no new UI component library, styling framework, or icon system MUST be added
- AND existing shared components and configured project styling MUST be reused where suitable

## Acceptance Criteria

- Check-in filters are visibly grouped and labeled From/To.
- Check-out filters are visibly grouped and labeled From/To.
- Normal table and filter UX does not expose raw reservation, guest, room, or room type IDs.
- Guest and room filters use human-readable labels/selectors.
- Reservation table displays reservation reference, primary guest name, room identifiers, and room type labels.
- Reservation display supports one primary guest/holder with multiple reservation item summaries.
- Create/edit supports adding and removing item rows.
- Each item row supports room type, optional room filtered by type, and guest count.
- Availability validation remains in the service layer and runs per assigned item.
- Prototype alignment improves within the 400-line review budget.
- EN/ES i18n strings are updated.
- No new UI libraries are introduced.
