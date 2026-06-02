# Delta for Rooms

## ADDED Requirements

### Requirement: Check-In Occupancy State Transition

The system MUST set the assigned room for a successful, property-scoped check-in to `occupied`, and it MUST update only the room associated with the checked-in reservation item.

#### Scenario: Successful check-in marks the assigned room occupied

- GIVEN the current session is scoped to property A
- AND a reservation item in property A passes all check-in validations
- AND its assigned room in property A is in an assignable state
- WHEN the check-in service completes successfully
- THEN that assigned room MUST be updated to `occupied`
- AND no unrelated room state in property A or property B may be changed

#### Scenario: Rejected check-in does not mutate room state

- GIVEN the current session is scoped to property A
- AND a room in property A is referenced by a check-in attempt
- WHEN the check-in service rejects the attempt for invalid property, date, status, or room conditions
- THEN the referenced room state MUST remain unchanged

#### Scenario: Cross-property room cannot be occupied by check-in

- GIVEN the current session is scoped to property A
- AND a referenced room belongs to property B
- WHEN the check-in service executes
- THEN the system MUST reject or not find the room
- AND it MUST NOT update that room to `occupied`

## Acceptance Criteria

- A valid check-in changes only the assigned room for the checked-in reservation item to `occupied`.
- Rejected check-in attempts leave room state unchanged.
- Room occupancy changes remain property-scoped.