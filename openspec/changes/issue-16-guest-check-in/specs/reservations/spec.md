# Delta for Reservations

## ADDED Requirements

### Requirement: Reservation Item Check-In Eligibility

The system MUST allow guest check-in only for a reservation item that belongs to the current session property, whose parent reservation also belongs to that property, whose parent reservation is in `confirmed` or `partially_checked_in`, and whose reservation item is in `confirmed`.

#### Scenario: Check in a valid confirmed reservation item

- GIVEN the current session is scoped to property A
- AND a reservation in property A is in `confirmed`
- AND one of its reservation items in property A is in `confirmed`
- WHEN the check-in service executes for that reservation item within its allowed stay window
- THEN the service MUST accept the operation for property A

#### Scenario: Reject invalid reservation or reservation item status

- GIVEN the current session is scoped to property A
- AND a reservation item belongs to property A
- WHEN the parent reservation is not `confirmed` or `partially_checked_in`, OR the reservation item is not `confirmed`
- THEN the check-in service MUST reject the operation
- AND it MUST NOT create or update a stay
- AND it MUST NOT change reservation, reservation item, or room state

#### Scenario: Reject out-of-window check-in attempt

- GIVEN the current session is scoped to property A
- AND a reservation item belongs to property A
- WHEN the check-in request falls outside the reservation item's allowed stay window
- THEN the check-in service MUST reject the operation
- AND it MUST NOT create or update a stay

#### Scenario: Reject cross-property reservation access

- GIVEN the current session is scoped to property A
- AND the referenced reservation or reservation item belongs to property B
- WHEN the check-in service executes
- THEN the service MUST reject or not find the target
- AND it MUST NOT mutate property B data

### Requirement: Assigned Room Validation During Check-In

The system MUST require a concrete assigned room for check-in and MUST validate that the selected room exists, belongs to the current session property, matches the reservation item's room assignment and room type constraints, and is in a check-in-assignable physical state.

#### Scenario: Reject missing or invalid room assignment

- GIVEN the current session is scoped to property A
- AND a reservation item is otherwise eligible for check-in
- WHEN no concrete room is assigned, OR the referenced room does not exist in property A
- THEN the check-in service MUST reject the operation
- AND it MUST NOT create or update a stay

#### Scenario: Reject room type mismatch

- GIVEN the current session is scoped to property A
- AND a reservation item requires a specific room type
- WHEN the assigned room belongs to a different room type
- THEN the check-in service MUST reject the operation
- AND it MUST NOT mark the item as checked in

#### Scenario: Reject non-assignable room state

- GIVEN the current session is scoped to property A
- AND a reservation item is otherwise eligible for check-in
- WHEN the assigned room is in `occupied`, `maintenance`, or `inactive`
- THEN the check-in service MUST reject the operation
- AND it MUST NOT create or update a stay
- AND it MUST NOT change the room state

### Requirement: Stay Creation and Update Consistency

The system MUST create or reconcile exactly one active stay for a successful reservation-item check-in, and any existing stay reuse MUST be limited to retry-safe updates for the same property, reservation item, and room.

#### Scenario: Create a stay on first successful check-in

- GIVEN the current session is scoped to property A
- AND a reservation item in property A is valid for check-in
- AND no stay exists for that reservation item
- WHEN the check-in service succeeds
- THEN the system MUST create one stay linked to that reservation item
- AND the stay MUST belong to property A
- AND the stay MUST be `active`
- AND the stay MUST record the actual check-in timestamp, assigned room, and expected check-out date

#### Scenario: Reconcile a retry-safe existing stay

- GIVEN the current session is scoped to property A
- AND an existing stay already belongs to the same property, reservation item, and assigned room
- WHEN the check-in request is retried in a way that still represents the same active occupation
- THEN the system MAY update that stay consistently instead of creating a duplicate
- AND it MUST preserve one active stay for the reservation item

#### Scenario: Reject conflicting existing stay data

- GIVEN the current session is scoped to property A
- AND an existing stay for the reservation item points to a different property, reservation item, or incompatible room state
- WHEN the check-in service executes
- THEN the system MUST reject the operation
- AND it MUST NOT create an additional stay

### Requirement: Reservation and Reservation Item Status Updates

The system MUST set a successfully checked-in reservation item to `checked_in` and MUST derive the parent reservation status from all non-cancelled and non-`no_show` items in the same property-scoped reservation.

#### Scenario: Partial group arrival updates reservation to partially checked in

- GIVEN the current session is scoped to property A
- AND a reservation in property A has multiple non-cancelled, non-`no_show` items
- AND at least one sibling item remains not checked in after a successful item check-in
- WHEN the check-in service completes
- THEN the checked-in item MUST be set to `checked_in`
- AND the parent reservation MUST be set to `partially_checked_in`

#### Scenario: Final eligible item arrival updates reservation to checked in

- GIVEN the current session is scoped to property A
- AND a reservation in property A has no remaining eligible items outside `checked_in` after a successful item check-in
- WHEN the check-in service completes
- THEN the checked-in item MUST be set to `checked_in`
- AND the parent reservation MUST be set to `checked_in`

#### Scenario: Cancelled and no-show items do not prevent full check-in status

- GIVEN the current session is scoped to property A
- AND a reservation includes cancelled or `no_show` items
- WHEN all remaining non-cancelled and non-`no_show` items are checked in successfully
- THEN the parent reservation MUST be set to `checked_in`
- AND cancelled or `no_show` items MUST NOT block that transition

### Requirement: Check-In Service Ownership

The system MUST keep check-in validation, stay coordination, reservation-item status mutation, reservation status derivation, and room-state mutation inside feature service or business-rule boundaries rather than JSX components.

#### Scenario: UI consumes a service boundary for check-in

- GIVEN a user-facing check-in trigger exists
- WHEN the trigger is executed
- THEN the UI MUST call a typed feature service, hook, or business-rule boundary
- AND the UI MUST NOT implement property checks, date eligibility, room validation, or lifecycle mutation logic in JSX

#### Scenario: Service remains authoritative for rejected check-in

- GIVEN a caller attempts an invalid check-in
- WHEN the request reaches the system
- THEN the service boundary MUST reject the operation even if the UI allowed the attempt
- AND no component-level logic MAY override that rejection

## MODIFIED Requirements

### Requirement: Reservation Status Display

The system MUST display reservation status using the supported states: `pending`, `confirmed`, `partially_checked_in`, `checked_in`, `checked_out`, `cancelled`, and `no_show`.
(Previously: The supported statuses omitted `partially_checked_in` and used legacy checked-in/no-show naming.)

#### Scenario: Supported statuses are rendered consistently

- GIVEN reservations exist in different lifecycle states
- WHEN the list or detail view is shown
- THEN each reservation MUST display one of the supported statuses
- AND unsupported or unknown statuses MUST NOT be silently shown as valid

#### Scenario: Status-specific actions are visible only when allowed

- GIVEN a reservation has a status with restricted actions
- WHEN the row actions or detail actions are rendered
- THEN the UI MUST hide or disable actions that the service would reject
- AND service-layer rules MUST remain authoritative even if the UI hides an action

## Acceptance Criteria

- Only property-scoped reservation items in `confirmed` under reservations in `confirmed` or `partially_checked_in` are eligible for check-in.
- Invalid room, date, status, assignment, room-type, and cross-property inputs are rejected by the service.
- Successful check-in creates or safely reconciles exactly one active stay for the reservation item.
- Successful check-in sets the reservation item to `checked_in`.
- Parent reservation status becomes `partially_checked_in` or `checked_in` based on eligible sibling items only.
- Check-in logic remains owned by feature service/business-rule boundaries rather than JSX.