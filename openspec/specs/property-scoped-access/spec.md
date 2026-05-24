# Property-Scoped Access Specification

## Purpose

Define InnHub's MVP property-scoped data access behavior so authenticated users can only access operational records for their own property, future feature services have a consistent access rule, and cross-property data exposure is prevented or explicitly deferred to planned backend policy enforcement.

## Requirements

### Requirement: Session-Derived Property Scope

The system MUST derive data-access property scope from the authenticated app session instead of UI input or arbitrary caller-provided values.

#### Scenario: Service receives current session property

- GIVEN an authenticated app session contains exactly one `property_id`
- WHEN a service or query boundary prepares operational data access
- THEN it MUST use the session-derived property scope as the current property context
- AND it MUST NOT require JSX components to perform direct auth lookups or direct InsForge queries

#### Scenario: Missing property scope is rejected

- GIVEN no authenticated session property is available, or the property scope is blank
- WHEN operational data access is requested
- THEN the system MUST reject the request before building or executing the data access operation
- AND it MUST expose a safe error state that does not leak tokens, anon keys, JWTs, or raw backend payloads

#### Scenario: Component-supplied property scope is not trusted

- GIVEN a component, route, form, or URL provides a `property_id` value
- WHEN a service needs property scope for operational records
- THEN the service MUST prefer the authenticated session property context
- AND it MUST NOT trust component-supplied property IDs as the authority for the current MVP property

### Requirement: Operational Query Scoping

The system MUST scope implemented operational data access by `property_id` whenever operational records are read, created, updated, or deleted through repository service boundaries.

#### Scenario: Operational reads include property filter

- GIVEN a service reads property-owned operational records
- WHEN the data access operation is built or executed
- THEN the operation MUST include a `property_id` filter or equivalent enforcement using the current session property
- AND unscoped operational reads MUST be rejected by the implemented boundary

#### Scenario: Operational writes include property ownership

- GIVEN a service creates an operational record that belongs to a property
- WHEN the write operation is built or executed
- THEN the record MUST be associated with the current session property
- AND the caller MUST NOT be able to assign a different property through UI input

#### Scenario: Operational mutations constrain the target property

- GIVEN a service updates or deletes a property-owned operational record
- WHEN the mutation is built or executed
- THEN the operation MUST constrain the target by the current session property or equivalent enforcement
- AND a cross-property target MUST NOT be accepted as a successful in-scope mutation

### Requirement: Cross-Property Access Prevention

The system MUST prevent or explicitly identify cross-property access attempts at the service/query boundary for the scope implemented in this change.

#### Scenario: Mismatched property is blocked

- GIVEN an operation attempts to access an operational record for a property different from the authenticated session property
- WHEN the implemented service/query boundary can detect the mismatch before or during the operation
- THEN the system MUST block the operation
- AND it MUST return or expose a safe access-denied result rather than silently using the mismatched property

#### Scenario: Backend-only enforcement gaps are documented

- GIVEN a cross-property case cannot be fully prevented by repository-level helpers alone
- WHEN the change is verified
- THEN the limitation MUST be documented in the change evidence
- AND the required remote InsForge/PostgreSQL policy, constraint, or migration follow-up MUST be explicit before the change is accepted

#### Scenario: Relationship consistency preserves property boundaries

- GIVEN an operation relates two or more property-owned records
- WHEN the relationship is built or validated by an implemented service boundary
- THEN the relationship MUST require all involved records to belong to the current session property where that check is in scope
- AND any relationship checks deferred to database policy or later feature services MUST be documented as such

### Requirement: Operational Table Coverage

The property-scoped access rule MUST apply to property-owned MVP tables defined by the canonical database schema, while allowing implementation coverage to be phased and documented.

#### Scenario: Property-owned table set is known

- GIVEN reviewers inspect the property-scoped access change
- WHEN they compare the covered tables with the canonical database schema
- THEN the intended operational table set MUST include `profiles`, `guests`, `room_types`, `rooms`, `reservations`, `reservation_items`, `stays`, `stay_guests`, `housekeeping_tasks`, `maintenance_tickets`, `invoices`, and `payments`
- AND any table not directly implemented in this change MUST have a documented reason or follow-up boundary

#### Scenario: Properties table is treated as a scoped root

- GIVEN the current property profile itself is accessed
- WHEN the service reads or updates the current property record
- THEN it MUST use the authenticated session `property_id` as the allowed property identity
- AND it MUST NOT allow users to select or mutate another property as the current MVP context

### Requirement: Architecture Boundary Compliance

The property-scoped access foundation MUST follow InnHub's frontend architecture boundaries and keep backend access behind services, hooks, or adapters.

#### Scenario: Components do not call backend directly

- GIVEN reviewers inspect JSX components, pages, layouts, and shared UI
- WHEN they check dependencies and behavior
- THEN components MUST NOT create InsForge clients directly
- AND components MUST NOT call InsForge database APIs directly
- AND property-scoped access MUST be owned by service, hook, or adapter boundaries

#### Scenario: Feature services consume shared scoping rule

- GIVEN future feature services for properties, room types, rooms, guests, reservations, operations, billing, reports, or dashboard access operational data
- WHEN they need the current property context
- THEN they SHOULD consume the shared property-scoping rule rather than duplicating ad hoc filters
- AND they MUST NOT invent a separate current-property source for the MVP

### Requirement: Boundary With Service Layer Work

The system MUST define property-scoping behavior without requiring full feature CRUD or a large generic service layer in this change.

#### Scenario: Issue #9 remains available for broader service layer

- GIVEN issue #7 is implemented
- WHEN issue #9 service-layer work is planned
- THEN issue #9 MAY build feature-specific services on top of the property-scoped access boundary
- BUT issue #7 MUST NOT be required to implement complete CRUD services for each module

#### Scenario: Issue #7 provides enforceable contracts

- GIVEN future service-layer or CRUD issues begin
- WHEN they access operational data
- THEN they MUST have a documented and testable property-scope contract to follow
- AND deviations from that contract MUST be explicit in future change artifacts

### Requirement: Remote Policy and Repository Enforcement Boundary

The system MUST clearly distinguish repository-level service/query enforcement from remote InsForge/PostgreSQL policy enforcement.

#### Scenario: Repository enforcement is not overstated

- GIVEN the implemented change uses frontend/service helper enforcement
- WHEN reviewers inspect acceptance evidence
- THEN the evidence MUST NOT claim complete database-level isolation unless remote policy enforcement is actually implemented and validated
- AND any remaining backend-policy risk MUST be recorded with a follow-up path

#### Scenario: Remote policy changes are planned before execution

- GIVEN remote InsForge/PostgreSQL policies, RLS rules, functions, or migrations are needed
- WHEN implementation is prepared
- THEN those remote changes MUST be planned in design/tasks before apply
- AND validation and rollback evidence MUST be captured if such changes are executed

### Requirement: TDD and Validation

The implementation MUST satisfy strict TDD for property-scoped access behavior before verification is accepted.

#### Scenario: Tests cover scoped access behavior

- GIVEN strict TDD is enabled
- WHEN issue #7 is applied
- THEN tests running through `npm run test:run` MUST cover valid session property scope, missing or blank property scope rejection, operational query scoping, and representative cross-property prevention or documented deferral
- AND tests SHOULD assert local service/query boundary behavior rather than brittle SDK internals where practical

#### Scenario: TDD evidence is recorded

- GIVEN issue #7 apply evidence is written
- WHEN reviewers inspect the apply artifact
- THEN it MUST record RED/GREEN or equivalent strict-TDD evidence for property-scope tests
- AND final verification MUST include `npm run test:run`

#### Scenario: Validation preserves scope boundaries

- GIVEN issue #7 is verified
- WHEN reviewers inspect changed files and evidence
- THEN the change MUST NOT include feature CRUD, seed data, Storage, realtime subscriptions, RBAC, broad UI work, payment behavior, or unplanned remote policy changes
- AND any documentation changes MUST keep property scoping described as a central data-access rule

## Acceptance Criteria

- Data-access property scope comes from the authenticated app session `property_id`.
- Missing, blank, or unavailable property scope is rejected before operational data access.
- Implemented operational reads include `property_id` filtering or equivalent enforcement.
- Implemented operational writes and mutations associate or constrain data with the current session property.
- Cross-property access attempts are blocked where the implemented service/query boundary can detect them, and backend-only enforcement gaps are documented.
- JSX components do not create InsForge clients or call InsForge database APIs directly.
- Future service-layer work has a clear property-scoping contract without requiring full CRUD in this change.
- Repository-level enforcement is not represented as complete database-level isolation unless remote policy enforcement is implemented and validated.
- Strict-TDD tests run through `npm run test:run` and cover critical scoped-access behavior.
- Feature CRUD, seed data, Storage, realtime, RBAC, broad UI, payment behavior, and unplanned remote policy changes remain out of scope.
