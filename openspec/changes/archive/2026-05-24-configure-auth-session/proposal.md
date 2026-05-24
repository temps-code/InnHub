# Proposal — configure-auth-session

## Change ID

`configure-auth-session`

## Related Issue

- Issue #5: `feat(auth): configure authentication and user session`

## SDD Preflight

| Setting | Decision |
| ------- | -------- |
| Execution mode | Interactive |
| Artifact store | OpenSpec |
| PR strategy | Auto-forecast |
| Review budget | 400 changed lines |
| Strict TDD | Enabled through `openspec/config.yaml` |
| Skill resolution | `none` — no parent-injected skill paths were available in this delegated runtime; this proposal used the assigned SDD proposal role instructions plus project files. |

## Intent

Implement InnHub's base authentication and session foundation with InsForge so the frontend can distinguish authenticated users from guests, expose the current session/profile/property context, and enforce the existing protected route boundary with real session behavior.

This change converts the structural-only protected routing foundation into an authenticated application boundary while keeping feature CRUD, role management screens, data policies, seed data, and storage out of scope.

## Problem

InnHub now has:

- a configured InsForge frontend client boundary;
- a core database schema with `profiles.auth_user_id`, `profiles.property_id`, role/status fields, and one-property-per-user structure;
- a canonical app routing spec whose protected layout is intentionally structural only.

Without issue #5, protected routes can still render without a real session, the frontend has no reliable current-user context, and later feature slices may duplicate auth lookups or make property-scoping assumptions independently. That would weaken the MVP rule that each user belongs to exactly one property and make issue #7 property-scoped access harder to design cleanly.

## Proposed Change

Add a narrow auth/session foundation around the existing InsForge client and app routing layers:

- replace the public login placeholder with a real login entry point sufficient for MVP validation;
- provide logout behavior for an authenticated user;
- expose current session state to the frontend through a provider/hook boundary;
- fetch or derive the current InnHub profile linked by `profiles.auth_user_id`;
- expose the authenticated user's single `property_id` as part of the app session context;
- enforce protected routes so unauthenticated users must authenticate before entering `/app/*`;
- keep InsForge calls inside auth/service boundaries, not JSX components;
- add strict-TDD tests for session state, protected-route behavior, login/logout service behavior, and profile/property linkage where practical;
- update existing route/login copy only where needed to reflect real auth behavior.

## Scope

In scope:

- `features/auth` module foundation for auth-specific services, types, hooks, and UI needed by this issue;
- app-level auth provider/session context composition;
- protected-route enforcement for the existing `/app/*` route group;
- public login page behavior replacing the structural placeholder;
- logout entry point in the existing shell/topbar area if design chooses that placement;
- current session/profile/property context available to frontend consumers;
- InsForge Auth integration through the approved shared InsForge client boundary;
- profile lookup against `profiles.auth_user_id` and active profile/property validation;
- loading, unauthenticated, authenticated, and error states needed for route enforcement;
- focused tests under `npm run test:run` following strict TDD;
- validation evidence for lint/test/build during later apply/verify.

## Acceptance Boundary

The change is acceptable when:

- login and logout work through the selected InsForge Auth SDK/API path;
- authenticated session state is available to frontend code through a controlled provider/hook boundary;
- the current app session includes the linked InnHub profile and exactly one `property_id`;
- `/app/*` protected routes require a valid authenticated session before rendering protected app content;
- unauthenticated users are redirected or blocked through a clear public auth path;
- components do not create InsForge clients or call InsForge directly;
- tests verify the auth/session and protected-route behavior through `npm run test:run`;
- implementation remains within the 400 changed-line review budget or tasks forecast a split before apply.

## Non-goals

Explicitly out of scope:

- user registration or self-service account creation;
- password reset, email verification, MFA, OAuth/social login, magic links, or invitation flows;
- role-based authorization or per-module permission gates beyond loading role data for context;
- user management CRUD screens;
- creating, editing, or deleting profiles/properties;
- issue #7 property-scoped data access policies/RLS beyond consuming the authenticated user's `property_id`;
- feature CRUD for properties, room types, rooms, guests, reservations, housekeeping, maintenance, billing, reports, or dashboard;
- seed data creation or demo user provisioning unless design documents a minimal test-only fixture strategy;
- database schema changes unless design proves a small auth-support adjustment is required and approved before apply;
- realtime subscriptions;
- InsForge Storage buckets, uploads, file metadata, or attachments;
- payment gateway behavior;
- broad visual redesign, Tailwind/library installation, or unrelated reusable UI expansion.

## Affected Areas

Likely implementation areas for later phases:

- `src/features/auth/*` for auth services, types, hooks, login UI, and tests;
- `src/app/providers/*` for auth/session provider wiring;
- `src/app/routes/*` and/or `src/app/layouts/ProtectedLayout.tsx` for real protected-route enforcement;
- `src/app/shell/*` if logout or current-user display belongs in the protected shell;
- `src/shared/services/insforgeClient.ts` only if the existing client boundary needs a small reusable adaptation for auth calls;
- `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts` if user-facing login/session copy changes;
- `src/app/__tests__/*` and `src/features/auth/**/__tests__/*` for route/provider/service coverage;
- OpenSpec artifacts under `openspec/changes/configure-auth-session/`.

Exact file names, API shapes, and test boundaries should be finalized in the design phase.

## Dependencies

- `@insforge/sdk` is already installed and must remain the official frontend InsForge integration path.
- `src/shared/services/insforgeClient.ts` is the approved shared client/config boundary.
- `openspec/specs/backend-environment/spec.md` defines environment variable and secret-hygiene requirements.
- `openspec/specs/app-routing/spec.md` defines the current public/protected route foundation that this change upgrades from structural-only to real auth enforcement.
- `openspec/specs/database-schema/spec.md` defines `profiles.auth_user_id`, unique auth linkage, `profiles.property_id`, role, and status fields.
- `docs/05-architecture.md` requires components not to call InsForge directly and keeps backend access inside services/hooks.
- `docs/07-functional-specification.md` defines FR-02 user/role handling and FR-16 property isolation.

## Rollout and Review Considerations

This change should start on `features` after proposal/spec/design/tasks approval. Because auth can grow quickly, the tasks phase must forecast review size against the 400 changed-line budget.

Recommended rollout style for apply:

1. add failing tests for auth/session service/provider behavior and protected-route enforcement;
2. implement the smallest auth service boundary using the existing InsForge client;
3. add app session provider/hook and profile/property context;
4. replace the login placeholder with MVP login/logout behavior;
5. enforce protected routes using the provider state;
6. update only necessary i18n copy;
7. run `npm run test:run`, `npm run lint`, and `npm run build` before verify.

If design or task planning forecasts more than 400 changed lines, split the work before apply. A likely split would be provider/service foundation first, then route/login UI enforcement second.

## Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| InsForge Auth SDK/API details differ from assumptions | Fetch current InsForge auth documentation during design/apply before choosing method names or return shapes. |
| Components call InsForge directly | Keep all auth calls inside `features/auth` services/hooks and inject them into providers where needed. |
| Property scoping is partially implemented in the UI but not enforced in data access | Treat this issue as session context only; defer data-access policy enforcement to issue #7. |
| Missing profile for an authenticated user creates ambiguous app state | Define a clear invalid-session/profile-missing state in spec/design and block protected content until resolved. |
| Inactive profiles can still access protected routes | Include profile `status` handling in the session boundary and define expected behavior before apply. |
| Login UI expands into full account management | Keep MVP login/logout only; defer registration, reset, invitations, and user admin to later issues. |
| Auth work exceeds review budget | Forecast in tasks and split into chained PR-ready work units if needed. |
| Secrets leak through errors or docs | Reuse backend-environment secret hygiene rules and avoid logging keys/tokens. |
| Tests become brittle against SDK internals | Mock service boundaries rather than SDK internals where practical; keep assertions on user-visible/session behavior. |

## Rollback

Rollback should be feasible by reverting the auth/session provider, `features/auth` additions, protected-route enforcement changes, login/logout UI updates, and related tests/i18n copy. No database rollback or InsForge Storage cleanup should be needed if the implementation remains within scope.

If remote InsForge auth configuration is touched during apply, rollback instructions must document how to restore the prior setting. No remote auth configuration changes should be made without being explicitly planned in design/tasks.

## Success Criteria

- Login and logout complete through the approved InsForge auth boundary.
- The frontend can access a typed current app session containing auth user data, linked profile data, and exactly one `property_id`.
- Protected `/app/*` routes no longer render protected content for unauthenticated users.
- Missing or inactive profile states are handled deliberately and do not silently grant access.
- Architecture boundaries remain intact: JSX components do not own InsForge/backend calls.
- Strict-TDD evidence is produced in later apply artifacts, with tests running through `npm run test:run`.
- The implementation is reviewable within the 400 changed-line budget or split before apply.

## Next Step

Proceed to SDD spec for `configure-auth-session` after proposal review and approval.
