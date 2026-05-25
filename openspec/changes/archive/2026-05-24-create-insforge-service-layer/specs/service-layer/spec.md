# Service Layer Specification

## Purpose

Define InnHub's frontend service-layer foundation for InsForge-backed data access so future feature modules use consistent, typed, property-scoped, and testable service boundaries without implementing feature CRUD in this change.

## Requirements

### Requirement: Shared Service Result Convention

The system MUST provide a shared convention for application-facing service results and safe service errors.

#### Scenario: Service operation returns typed success

- GIVEN a future feature service completes a backend-backed operation successfully
- WHEN the service returns to application callers
- THEN it MUST return a typed success result that contains the operation data or an explicit empty success value
- AND callers MUST be able to distinguish success from failure without inspecting raw SDK responses

#### Scenario: Service operation returns safe failure

- GIVEN a backend, SDK, configuration, validation, or property-scope failure occurs
- WHEN the service returns to application callers
- THEN it MUST return a typed failure result with a stable safe error code or message
- AND it MUST NOT expose access tokens, anon keys, JWTs, private keys, raw backend payloads, or raw SDK error objects to UI-facing callers

#### Scenario: Error mapping is reusable

- GIVEN multiple future feature services need to normalize backend failures
- WHEN they handle failed operations
- THEN they SHOULD use the shared service error/result convention instead of inventing incompatible per-feature result shapes

### Requirement: InsForge Client Isolation

The system MUST keep InsForge SDK and database access behind service or adapter boundaries rather than JSX components.

#### Scenario: Components do not call InsForge directly

- GIVEN reviewers inspect JSX components, pages, layouts, shared UI, and feature UI components
- WHEN they check imports and behavior
- THEN components MUST NOT create InsForge clients directly
- AND components MUST NOT call InsForge auth, database, storage, realtime, or function APIs directly
- AND UI code MUST consume hooks, providers, or services instead

#### Scenario: Service foundation uses approved client boundary

- GIVEN a service-layer helper or adapter needs InsForge access
- WHEN it creates or receives an InsForge client
- THEN it MUST use the approved shared InsForge client/config boundary
- AND it MUST NOT introduce an alternate backend SDK or duplicate environment variable parsing

#### Scenario: Missing configuration stays safe

- GIVEN InsForge configuration is missing or invalid
- WHEN a service-layer boundary reports the failure
- THEN it MUST expose an intentional safe service failure or configuration state
- AND it MUST NOT expose secret values in the failure

### Requirement: Property-Scoped Service Context

The service-layer foundation MUST define how future services consume authenticated session property scope and property-scoped access helpers.

#### Scenario: Service operation receives session-derived property scope

- GIVEN an authenticated app session includes exactly one property context
- WHEN a future property-owned service operation is prepared
- THEN the service operation MUST derive its property scope from the authenticated session context or a validated service context built from it
- AND it MUST NOT treat component, form, route, URL, or arbitrary payload property IDs as authoritative

#### Scenario: Service operation applies property-scope helper

- GIVEN a service operation targets a property-owned operational table
- WHEN it builds an InsForge query or payload for that operation
- THEN it MUST use the property-scoped access contract to require property scope, apply `property_id` filters, inject matching `property_id` ownership, or reject mismatches as appropriate
- AND unscoped operational access MUST be rejected by the service boundary

#### Scenario: Current property access uses root scope

- GIVEN a future service accesses the current property record itself
- WHEN it builds the data-access operation
- THEN it MUST constrain access by the current session property identity
- AND it MUST NOT allow the caller to select a different current property for the MVP

### Requirement: Query and Execution Boundary

The system MUST define a small query or execution contract that future feature services can test without live InsForge access or brittle SDK internals.

#### Scenario: Service tests use fake query boundary

- GIVEN service-layer foundation behavior is tested
- WHEN tests verify query execution, result mapping, or property-scope integration
- THEN they MUST be able to use fake query/executor objects or adapter contracts
- AND they SHOULD NOT require a live InsForge backend, real credentials, or deep mocks of SDK internals

#### Scenario: Query execution normalizes responses

- GIVEN an InsForge-style operation returns data or an error
- WHEN the service-layer boundary handles the response
- THEN it MUST map successful data to the shared success result convention
- AND it MUST map failures to safe shared service errors

#### Scenario: Foundation avoids large framework behavior

- GIVEN issue #9 is implemented
- WHEN reviewers inspect service-layer helpers
- THEN the change MUST remain a small foundation for future services
- AND it MUST NOT introduce an ORM, code generator, broad repository framework, or feature-specific CRUD API

### Requirement: Feature Service Preparation Pattern

The system MUST prepare a clear pattern for future feature services without implementing real feature CRUD in this change.

#### Scenario: Future services have ownership guidance

- GIVEN future features such as properties, room types, rooms, guests, reservations, operations, billing, reports, or dashboard need backend data
- WHEN their services are implemented in later issues
- THEN feature service files SHOULD own the data-access operation for their business context
- AND those services SHOULD compose shared service result, query/execution, and property-scope helpers

#### Scenario: Foundation-only scope is preserved

- GIVEN issue #9 changes are reviewed
- WHEN reviewers inspect repository changes
- THEN the change MUST NOT implement real CRUD services for properties, room types, rooms, guests, reservations, housekeeping, maintenance, billing, reports, dashboard, or any other feature module
- AND it MUST NOT add UI screens, forms, tables, workflows, seed data, realtime subscriptions, Storage behavior, schema migrations, or remote policy/RLS changes

#### Scenario: Example behavior remains generic

- GIVEN tests or examples need illustrative data to prove service-layer contracts
- WHEN the implementation uses fake tables, fake query results, or sample records
- THEN those examples MUST remain generic or test-local
- AND they MUST NOT become an accepted properties, room-types, rooms, guests, or reservations service implementation

### Requirement: Component Boundary Documentation

The service-layer convention MUST be documented clearly enough for future feature work and reviews.

#### Scenario: Architecture documentation names the service boundary

- GIVEN a contributor plans a future backend-backed feature
- WHEN they read the architecture documentation or SDD artifacts
- THEN they MUST see that components consume hooks/services rather than direct InsForge SDK/database calls
- AND they MUST see that feature services own data access for their business context

#### Scenario: Documentation includes property-scope relationship

- GIVEN a contributor plans a property-owned feature service
- WHEN they read the service-layer convention
- THEN they MUST understand that property-owned services consume session-derived property scope and issue #7 property-scoping helpers
- AND they MUST understand that repository/service-level helpers are distinct from complete database-level RLS or remote policy enforcement

### Requirement: Strict TDD and Validation

The service-layer foundation MUST satisfy strict TDD and project validation before acceptance.

#### Scenario: Tests cover service foundation behavior

- GIVEN strict TDD is enabled
- WHEN issue #9 is applied
- THEN tests running through `npm run test:run` MUST cover shared service result behavior, safe error normalization, property-scope integration contracts, and fake query/executor behavior where implemented
- AND tests MUST NOT require live InsForge credentials or a live backend

#### Scenario: TDD evidence is recorded

- GIVEN issue #9 apply evidence is written
- WHEN reviewers inspect the apply artifact
- THEN it MUST record RED/GREEN or equivalent strict-TDD evidence for the service-layer foundation tests
- AND final verification MUST include `npm run test:run`

#### Scenario: Validation preserves foundation scope

- GIVEN issue #9 is verified
- WHEN reviewers inspect changed files and evidence
- THEN the change MUST NOT include feature CRUD, UI workflow behavior, seed data, Storage, realtime, schema migrations, remote policy/RLS changes, or broad architecture rewrites
- AND final validation SHOULD include `npm run test:run`, `npm run lint`, and `npm run build` when TypeScript/runtime code changes

## Acceptance Criteria

- Shared service result and safe error conventions are defined for future InsForge-backed services.
- Raw SDK/backend errors and secret values are not exposed to UI-facing callers.
- InsForge SDK access remains behind approved service/adaptor boundaries, not JSX components.
- Property-owned service operations are expected to consume authenticated session property scope and issue #7 property-scoping helpers.
- Query/execution boundaries are testable with fake objects and do not require live InsForge credentials.
- Future feature services have a clear foundation pattern without implementing real CRUD in this issue.
- Architecture or SDD documentation states that components consume hooks/services rather than direct InsForge calls.
- Feature CRUD, seed data, UI workflows, Storage, realtime, schema migrations, remote policy/RLS work, and broad repository frameworks remain out of scope.
- Strict-TDD tests run through `npm run test:run` during apply and verify service-layer foundation behavior.
