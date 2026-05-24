# Proposal — create-insforge-service-layer

## Change ID

`create-insforge-service-layer`

## Related Issue

- Issue #9: `feat(api): create InsForge service layer`

## SDD Preflight

| Setting | Decision |
| ------- | -------- |
| Execution mode | Auto for planning only |
| Artifact store | OpenSpec |
| PR strategy | Auto-forecast |
| Review budget | 400 changed lines |
| Strict TDD | Enabled through `openspec/config.yaml` |
| Implementation permission | Do not implement code; stop after proposal/spec/design/tasks |
| Scope decision | Foundation only; do not include real CRUD feature services |
| Skill resolution | `none` — no parent-injected skill paths were available in this delegated runtime; this proposal used the assigned SDD proposal role instructions plus project files. |

## Intent

Create InnHub's frontend service-layer foundation for InsForge-backed data access so future feature modules can consume backend operations through consistent, typed, testable services instead of calling InsForge directly from components.

This change should define the shared service conventions that future properties, room types, rooms, guests, reservations, operations, billing, reports, and dashboard slices will build on. It should connect the existing InsForge client boundary, authenticated session context, and property-scoped access primitives into a reusable foundation without implementing a real CRUD feature service yet.

## Problem

InnHub now has the core prerequisites for backend-backed features:

- the InsForge SDK client/config boundary exists under shared services;
- auth/session provides an authenticated app session with a single `propertyId`;
- property-scoped access primitives define how repository/service code should require and apply property scope;
- the core database schema is versioned and validated;
- architecture rules state that components must not call InsForge directly.

However, future modules still lack a common service-layer convention for result types, safe error mapping, query execution boundaries, property-scope consumption, and test doubles. Without issue #9, each feature CRUD slice may invent its own InsForge access pattern, duplicate error handling, bypass property-scope helpers, leak raw backend errors, or make components aware of SDK details. That would make later MVP modules harder to review and less consistent.

## Proposed Change

Add a narrow service-layer foundation that future feature services can reuse:

- define shared service result and error contracts for safe application-facing responses;
- define a small query/execution boundary around InsForge-style operations without creating a large repository framework;
- standardize how property-scoped feature services should consume the authenticated session property scope and issue #7 helpers;
- provide testable utilities or adapter contracts that let service tests use fake query clients rather than live InsForge or brittle SDK internals;
- document the convention that components use hooks/services and feature services own data access;
- add strict-TDD tests for service result mapping, safe errors, property-scope integration contracts, and component/SDK boundary expectations where practical;
- keep the implementation foundation-only and defer actual CRUD services to later issues.

The design phase should decide the exact module/file names and whether the foundation lives entirely under `src/shared/services/` or includes a small `src/shared/types/` companion for reusable service types.

## Scope

In scope:

- shared service-layer primitives for typed success/error results;
- safe backend/SDK error normalization that does not expose tokens, anon keys, JWTs, or raw backend payloads;
- small query helper or executor contracts that future services can compose with InsForge database calls;
- explicit integration pattern with `src/shared/services/propertyScope.ts` from issue #7;
- guidance for feature services to receive property scope from authenticated session context instead of component-supplied property IDs;
- test utilities or fake query boundaries for unit tests;
- focused tests for service result behavior and property-scope service contracts;
- concise architecture documentation if the current service-layer convention is not explicit enough;
- OpenSpec apply evidence and validation in later phases.

Outcomes should prepare feature-level services without implementing feature CRUD. A small illustrative type or fake/example in tests is acceptable if it remains generic and does not become a properties, room-types, rooms, guests, or reservations service.

## Acceptance Boundary

The change is acceptable when:

- InsForge access remains isolated behind shared service/adaptor boundaries and feature service conventions;
- components have a documented and testable expectation to consume hooks/services rather than InsForge SDK calls;
- future feature services have a clear foundation for returning typed, safe results;
- property-scoped service operations are expected to use the authenticated session property context and issue #7 helpers;
- raw SDK/backend errors are normalized before reaching UI-facing callers;
- tests prove the shared service foundation behavior without requiring a live InsForge backend;
- no real CRUD feature service is implemented;
- implementation stays within the 400 changed-line review budget or tasks forecast a split before apply.

## Non-goals

Explicitly out of scope:

- CRUD services for properties, room types, rooms, guests, reservations, housekeeping, maintenance, billing, reports, dashboard, or any other feature module;
- UI screens, forms, tables, dashboards, or workflow behavior;
- seed/demo data for issue #8;
- database schema changes, migrations, constraints, or remote InsForge/PostgreSQL policy/RLS work;
- changing auth/session behavior from issue #5;
- changing property-scope primitive behavior from issue #7 except consuming its public contract;
- reservation overlap logic, availability algorithms, check-in/check-out workflows, cleaning automation, invoice generation, or payment behavior;
- realtime subscriptions or realtime service contracts;
- InsForge Storage buckets, uploads, file metadata, or attachments;
- RBAC/per-module authorization beyond documenting that feature services may later layer permissions on top of this foundation;
- introducing a large ORM, repository framework, code generator, or alternate backend SDK;
- broad architecture rewrite or folder reorganization unrelated to service-layer foundation.

## Dependencies

- `openspec/specs/backend-environment/spec.md` defines the existing InsForge SDK client/config boundary and secret hygiene rules.
- `openspec/specs/auth-session/spec.md` defines authenticated session state and the single `propertyId` context.
- `openspec/specs/property-scoped-access/spec.md` defines property-scope helpers and repository/service-level scoping rules.
- `openspec/specs/database-schema/spec.md` defines the MVP tables that future feature services will target.
- `docs/05-architecture.md` defines frontend layer boundaries: components avoid direct InsForge access and feature services own data access.
- `src/shared/services/insforgeClient.ts` is the approved SDK client/config boundary.
- `src/shared/services/propertyScope.ts` provides reusable property-scope primitives.
- `src/features/auth` exposes session/provider/hook behavior that future feature hooks can consume before calling services.

## Affected Areas

Likely implementation areas for later phases:

- `src/shared/services/*` for service result types, safe error mapping, query/executor contracts, or property-scoped service helpers;
- `src/shared/types/*` only if design determines shared service types should be separated from service implementation helpers;
- `src/shared/services/**/__tests__/*` or focused test files for the service-layer foundation;
- `docs/05-architecture.md` and `docs/05-architecture.es.md` if the service-layer convention needs concise documentation updates;
- OpenSpec artifacts under `openspec/changes/create-insforge-service-layer/`.

The change should not add files under `src/features/properties`, `src/features/room-types`, `src/features/rooms`, `src/features/guests`, `src/features/reservations`, or other feature CRUD folders except if design explicitly uses an empty placeholder already present in the project and keeps it non-functional. The preferred approach is to avoid feature folders entirely in issue #9.

## Rollout and Review Considerations

Recommended later apply sequence:

1. add failing tests for service result/error behavior and property-scoped service contracts;
2. implement the smallest shared service result and error-normalization helpers;
3. add a minimal query/executor abstraction that can be tested with fake query objects;
4. prove property-scope helpers are part of the service convention without adding real CRUD;
5. update concise architecture documentation if needed;
6. run `npm run test:run`, `npm run lint`, and `npm run build` for TypeScript changes;
7. record strict-TDD evidence in `apply-progress.md`.

Tasks should forecast changed lines against the 400-line review budget. If the design grows beyond foundation utilities/tests and concise docs, split before apply or reduce scope.

## Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Foundation becomes an abstract framework | Keep helpers small, concrete, and driven by upcoming feature-service needs; avoid ORM-style abstractions. |
| Scope creeps into CRUD | Explicitly defer properties, room types, rooms, guests, reservations, and other real services to their own issues. |
| Property scoping is bypassed by future services | Make the service-layer convention consume issue #7 helpers and document deviations as future-review blockers. |
| Components still call InsForge directly | Document and test the expected boundary; keep SDK/client usage in shared or feature services only. |
| Raw backend errors leak to UI | Normalize errors into stable safe codes/messages and test token/JWT/anon-key non-disclosure. |
| Tests couple to SDK internals | Use local contracts and fake query/executor boundaries rather than mocking deep SDK behavior. |
| Issue #9 duplicates auth/session logic | Consume existing session/property context contracts; do not add new auth state or direct profile lookup logic. |
| Remote policy/security expectations are overstated | Keep this as a frontend service-layer foundation; remote RLS/policy work remains outside scope. |
| Review budget is exceeded | Forecast in tasks and split before apply if implementation approaches 400 changed lines. |

## Rollback

Rollback should be low risk if implementation remains foundation-only. Revert the shared service-layer helper files, tests, documentation updates, and OpenSpec apply evidence. No database migration rollback, remote InsForge cleanup, seed-data cleanup, Storage cleanup, or UI rollback should be required.

If later design unexpectedly proposes any remote backend or schema change, rollback must be planned explicitly before implementation and approved separately. The default issue #9 plan should not include such changes.

## Success Criteria

- InnHub has a documented service-layer foundation for InsForge-backed feature services.
- Components are kept away from direct InsForge SDK/database calls by convention and testable contracts.
- Future feature services have typed result/error primitives and a safe error-mapping pattern.
- The service foundation integrates with session-derived property scope and issue #7 helpers.
- No real feature CRUD service is implemented in this issue.
- Tests cover the foundation behavior through `npm run test:run` in later apply/verify phases.
- The implementation remains reviewable within the 400-line budget or is split before apply.

## Next Step

Proceed to SDD spec for `create-insforge-service-layer` after proposal review/approval, still without implementing application code.
