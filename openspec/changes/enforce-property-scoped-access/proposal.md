# Proposal — enforce-property-scoped-access

## Change ID

`enforce-property-scoped-access`

## Related Issue

- Issue #7: `feat(security): enforce property-scoped data access`

## SDD Preflight

| Setting | Decision |
| ------- | -------- |
| Execution mode | Auto for planning only |
| Artifact store | OpenSpec |
| PR strategy | Auto-forecast |
| Review budget | 400 changed lines |
| Strict TDD | Enabled through `openspec/config.yaml` |
| Implementation permission | Do not implement code; stop after proposal/spec/design/tasks |
| Skill resolution | `none` — no parent-injected skill paths were available in this delegated runtime; this proposal used the assigned SDD proposal role instructions plus project files. |

## Intent

Establish InnHub's property-scoped data access foundation so authenticated users can only read and write operational data that belongs to their own MVP property.

This change should turn the existing session `propertyId` and schema-level `property_id` columns into a reusable data-access rule for future feature services. It should define how frontend services and InsForge queries receive, require, and apply the authenticated user's property scope before CRUD modules begin to grow independently.

## Problem

InnHub now has the prerequisites for property-scoped access:

- issue #5 provides an authenticated app session with exactly one `propertyId` from the linked profile;
- issue #6 created the core schema where operational records carry `property_id`;
- the architecture requires backend/InsForge access to stay behind feature services and hooks, not JSX components.

However, the project does not yet have a reusable enforcement pattern for service/query code. Without issue #7, upcoming service-layer and CRUD work could accidentally query operational tables without `property_id`, accept caller-supplied cross-property IDs, or duplicate inconsistent filters across features. That would violate FR-16 and the central MVP rule that each user sees only their own property's operational data.

## Proposed Change

Define and implement a narrow property-scope access foundation that future feature services can reuse:

- establish a typed property-scope context derived from the authenticated app session `propertyId`;
- provide shared service/query helpers that require property scope before operational data access;
- standardize how InsForge database queries apply `.eq("property_id", propertyId)` or the equivalent property filter;
- add guard utilities that reject attempts to build scoped operations without a valid `propertyId`;
- add tests that prove scoped query builders include `property_id` and reject missing or mismatched scope;
- document property scoping as a central service-layer rule in the OpenSpec artifacts and, if design chooses, the smallest appropriate architecture documentation location;
- keep the work focused on access boundaries and validation helpers rather than feature CRUD.

The exact helper shape, file layout, and whether this includes remote InsForge policy/RLS work should be finalized during spec/design. The default expectation for this proposal is repository-level frontend/service enforcement first, with any remote backend policy changes explicitly planned before apply.

## Scope

In scope:

- property-scope service/query contracts that consume `propertyId` from issue #5's auth session;
- shared backend/service utilities for operational table access where `property_id` is mandatory;
- typed helpers or adapters that make unscoped operational queries hard to write;
- tests for successful scoped query construction and blocked missing/cross-property cases;
- documentation of the central rule: every operational service query must be scoped by the current session property;
- validation evidence through `npm run test:run` during later apply/verify;
- design analysis of whether InsForge/PostgreSQL policy-level enforcement is feasible in this project stage.

Candidate operational tables include the property-owned tables from the canonical database spec:

- `profiles`;
- `guests`;
- `room_types`;
- `rooms`;
- `reservations`;
- `reservation_items`;
- `stays`;
- `stay_guests`;
- `housekeeping_tasks`;
- `maintenance_tickets`;
- `invoices`;
- `payments`.

Exact table coverage should be finalized in spec/design based on review budget and implementation risk.

## Acceptance Boundary

The change is acceptable when:

- frontend/service data-access helpers require a valid current `propertyId` before operational queries are built or executed;
- operational queries in the implemented boundary are scoped by `property_id`;
- missing, blank, or invalid property scope is rejected safely before data access;
- cross-property access attempts are prevented by the designed service/query boundary, or explicitly documented as requiring remote policy enforcement in a later approved slice;
- future feature services have a clear pattern for consuming the authenticated session property scope without duplicating direct auth lookups;
- JSX components still do not create InsForge clients or call InsForge database APIs directly;
- critical cases are covered by strict-TDD tests or explicitly validated with evidence;
- implementation remains within the 400 changed-line review budget or tasks forecast a split before apply.

## Non-goals

Explicitly out of scope:

- feature CRUD screens or workflows for properties, room types, rooms, guests, reservations, stays, housekeeping, maintenance, billing, reports, or dashboard;
- seed/demo data creation for issue #8;
- a full generic repository framework or large ORM-style abstraction;
- changing the authentication/session behavior completed in issue #5 except consuming its `propertyId`;
- schema redesign or broad table migrations unless design proves a small security-support migration is required and approved before apply;
- reservation overlap prevention, availability algorithms, check-in/check-out workflows, cleaning automation, invoice generation, or payment workflows;
- RBAC/per-module authorization beyond property isolation;
- user management, invitations, registration, password reset, MFA, OAuth/social login, or account administration;
- realtime subscriptions or realtime channel authorization;
- InsForge Storage buckets, uploads, file metadata, or attachments;
- payment gateway behavior;
- broad UI redesign or new UI library installation.

## Dependencies

- `openspec/specs/auth-session/spec.md` defines the current app session and single `property_id` context from issue #5.
- `openspec/specs/database-schema/spec.md` defines property-owned operational tables and `property_id` structure from issue #6.
- `openspec/specs/backend-environment/spec.md` defines the approved InsForge client/config boundary.
- `docs/05-architecture.md` requires components to avoid direct InsForge access and assigns data access to services.
- `docs/07-functional-specification.md` defines FR-16 and the business rule that operational records are filtered by property.
- `src/shared/services/insforgeClient.ts` is the existing SDK client/config boundary.
- `src/features/auth` exposes `useAuthSession()` and typed session data containing `propertyId`.

## Affected Areas

Likely implementation areas for later phases:

- `src/shared/services/*` for generic property-scope query helpers or backend service utilities;
- `src/shared/types/*` if shared property-scope types are needed outside auth;
- `src/features/auth/*` only for type reuse or exported session context consumption, not auth behavior changes;
- future feature service folders only if design chooses a small example or contract test target;
- `src/shared/services/**/__tests__/*` or similar test paths for property-scope helper coverage;
- OpenSpec artifacts under `openspec/changes/enforce-property-scoped-access/`;
- optional concise updates to architecture documentation if design determines the central rule is not already documented clearly enough.

Exact file names and whether helpers live in `shared/services` or a more specific backend-access module should be decided in design.

## Rollout and Review Considerations

This change should proceed through spec, design, and tasks before any code is implemented. Tasks must forecast changed lines against the 400-line review budget.

Recommended rollout style for apply:

1. add failing tests for property-scope helper behavior and blocked missing scope;
2. implement the smallest typed property-scope contract;
3. add InsForge query helper/adapters that apply `property_id` consistently;
4. add tests for representative operational table access patterns;
5. document the service-layer rule and any remote enforcement deferrals;
6. run `npm run test:run`, `npm run lint`, and `npm run build` if TypeScript/runtime code changes;
7. record strict-TDD evidence in apply artifacts.

If design or task planning forecasts more than 400 changed lines, split before apply. A likely split is: Work Unit A for shared property-scope primitives/tests, Work Unit B for applying those primitives to initial service-layer patterns or remote validation evidence.

## Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Frontend-only filtering is mistaken for full backend security | Clearly distinguish service/query scoping from remote database policy enforcement; design must decide what is feasible now and document deferrals. |
| Future services bypass the helper | Make the helper easy to use, testable, and documented as the required pattern before feature CRUD starts. |
| Scope grows into CRUD implementation | Keep issue #7 focused on access boundaries, tests, and documentation; defer CRUD to issues #10-#21. |
| Property IDs are accepted from UI input instead of session | Require property scope to come from the authenticated app session or service context, not arbitrary component props. |
| Cross-property relationships need database constraints beyond frontend helpers | Use the existing schema information to identify gaps and document any policy/migration follow-up explicitly. |
| InsForge SDK query API details differ from assumptions | Confirm installed SDK docs/types during design/apply and keep SDK-specific logic behind service adapters. |
| Tests become too tied to SDK internals | Prefer testing local service/query helpers and fake query builders rather than brittle SDK internals. |
| Review budget is exceeded | Forecast in tasks and split into reviewable work units before apply. |
| Secrets leak through validation errors | Follow backend-environment and auth-session secret hygiene rules; errors should not expose anon keys, JWTs, or tokens. |

## Rollback

Rollback should be low risk if implementation remains within scope. Revert the property-scope helper modules, tests, documentation/OpenSpec apply evidence, and any small service-boundary wiring introduced by this change.

If design later approves remote InsForge/PostgreSQL policy changes, rollback instructions must include the exact policy/migration reversal and validation steps. No remote security policy changes should be made without being explicitly planned and reviewable.

## Success Criteria

- InnHub has a clear, documented property-scoped data-access rule for operational services.
- Service/query helpers require the current authenticated session `propertyId` before operational data access.
- Representative operational queries are proven to include `property_id` filters or equivalent enforcement.
- Missing or invalid property scope is blocked safely before data access.
- Cross-property access risks are either prevented by the implemented boundary or explicitly identified for a planned remote-policy follow-up.
- Components remain free of direct InsForge/database calls.
- Strict-TDD evidence is produced in later apply artifacts, with tests running through `npm run test:run`.
- The implementation is reviewable within the 400 changed-line budget or split before apply.

## Next Step

Proceed to SDD spec for `enforce-property-scoped-access` after proposal review/approval, without implementing code in this planning-only authorization.
