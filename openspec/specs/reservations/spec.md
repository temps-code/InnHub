# Reservations Specification

## Purpose

Define backend/service-facing room-availability validation that prevents overlapping active reservations within a property while preserving valid same-day turnover and maintenance blocking rules.

## Requirements

### Requirement: Service-Layer Overlap Prevention

The system MUST reject reservation create or update requests when the requested room and date range overlaps with an existing active blocker in the same property.

#### Scenario: Reject overlapping active reservation on create

- GIVEN a room already has an active blocking reservation for a date range
- WHEN a create request for the same room is submitted with an overlapping date range
- THEN the service MUST reject the request with a validation error
- AND the check MUST run in backend/service-facing logic, not UI-only logic

#### Scenario: Reject overlapping active reservation on update

- GIVEN a room already has an active blocking reservation for a date range
- WHEN an existing reservation is updated to an overlapping date range for that room
- THEN the service MUST reject the update with a validation error

### Requirement: Half-Open Interval Semantics

The system MUST evaluate reservation overlap using half-open intervals `[check_in, check_out)`.

#### Scenario: Overlap predicate

- GIVEN requested interval `[requested_check_in, requested_check_out)` and existing interval `[existing_check_in, existing_check_out)`
- WHEN availability is validated
- THEN the intervals MUST be treated as conflicting only when `requested_check_in < existing_check_out` AND `requested_check_out > existing_check_in`

#### Scenario: Same-day turnover allowed

- GIVEN an existing reservation with `check_out = D`
- WHEN a new reservation for the same room has `check_in = D`
- THEN the new reservation MUST be allowed if no other blocker conflicts

### Requirement: Blocking and Non-Blocking Reservation Statuses

The system MUST treat only active commitment statuses as blockers and MUST treat cancelled/no-show statuses as non-blocking.

#### Scenario: Active blocking statuses prevent assignment

- GIVEN a reservation for a room is in a configured active blocking status (including confirmed and checked-in/partially-checked-in equivalents in the implemented model)
- WHEN another reservation request overlaps that date range
- THEN availability validation MUST reject the request

#### Scenario: Cancelled or no-show does not block

- GIVEN a reservation for a room is in `cancelled` or `no_show`
- WHEN another reservation request overlaps that same date range
- THEN availability validation MUST NOT treat that record as a blocker

### Requirement: Update Self-Exclusion

The system MUST exclude the record being updated from overlap detection.

#### Scenario: Updating without creating self-conflict

- GIVEN a reservation update request references reservation item `X`
- WHEN overlap validation runs
- THEN the validation query MUST exclude `X` from blocker candidates
- AND the update MUST only fail for conflicts with other records

### Requirement: Property-Scoped Availability Checks

The system MUST apply property scoping to all overlap and maintenance blocker queries.

#### Scenario: Cross-property blockers ignored

- GIVEN property A and property B each have reservations for rooms with similar identifiers
- WHEN availability is validated for a request in property A
- THEN only blocker records from property A MUST be considered

### Requirement: Maintenance Availability Blockers

The system MUST treat maintenance tickets as blockers only when unresolved and explicitly configured to block availability.

#### Scenario: Unresolved blocking maintenance prevents reservation

- GIVEN a room has a maintenance ticket in unresolved status (`open` or `in_progress`) with `blocks_availability = true`
- WHEN a reservation request overlaps the maintenance period
- THEN availability validation MUST reject the request

#### Scenario: Non-blocking or resolved maintenance does not prevent reservation

- GIVEN a room has a maintenance ticket that is resolved OR has `blocks_availability = false`
- WHEN a reservation request overlaps that period
- THEN the maintenance ticket MUST NOT block availability

### Requirement: Concurrency Hardening Scope Boundary

This change MUST define service-layer deterministic validation and MUST treat database-level concurrency hardening as out of scope unless separately approved.

#### Scenario: Concurrent write hardening documented as follow-up

- GIVEN this change is reviewed for overlap prevention
- WHEN reviewers evaluate race-condition handling
- THEN the spec MUST state that DB-level locking, exclusion constraints, or equivalent transactional hardening are out of scope for this change
- AND any required hardening MUST be tracked as a follow-up change

## Acceptance Criteria

- Service/backend-facing validation rejects overlapping active reservations for the same room and property.
- Overlap uses half-open interval semantics `[check_in, check_out)`.
- Same-day checkout/check-in boundary is allowed.
- Cancelled and no-show statuses do not block availability.
- Update flows exclude the current reservation record from conflict checks.
- Availability checks remain property-scoped.
- Unresolved maintenance with `blocks_availability = true` blocks availability; resolved or non-blocking maintenance does not.
- DB concurrency hardening is explicitly documented as out of scope for this change.
