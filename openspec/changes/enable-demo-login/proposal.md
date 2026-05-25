# Proposal — enable-demo-login

## Change ID

`enable-demo-login`

## Related Issue

- Issue #48: `feat(auth): enable demo login for MVP validation`

## SDD Preflight

| Setting | Decision |
| ------- | -------- |
| Execution mode | Auto |
| Artifact store | OpenSpec only |
| PR strategy | Auto-forecast |
| Review budget | 400 changed lines |
| Strict TDD | Enabled through `openspec/config.yaml` |
| Implementation permission | Do not implement code in this proposal phase |
| Skill resolution | `none` — no parent-injected skill paths were available in this delegated runtime; this proposal used the assigned SDD proposal role instructions plus project files. |

## Intent

Add a narrow demo-login path that lets evaluators validate InnHub's protected MVP flows before full self-service onboarding exists, while preserving the real InsForge auth/session boundary and the existing profile/property validation rules.

The change should make demo access discoverable from the login screen without adding public signup, fake local sessions, or a bypass around `profiles.auth_user_id`, active profile status, and `property_id` requirements.

## Problem

InnHub already has an auth/session foundation, protected `/app/*` routes, an InsForge gateway, and one-property-per-user session rules. However, the current login UI only presents manual email/password inputs. A reviewer or evaluator cannot enter the protected app unless they already know valid credentials and the backend already contains a matching InsForge Auth user, active `profiles` row, and associated property.

Without a visible and documented demo-login path, issue #10 and later protected feature slices are hard to validate manually. Adding public registration would solve discoverability but is too broad because it requires decisions about property creation, profile activation, roles, invitations, and tenant onboarding.

## Proposed Change

Introduce an explicit demo-access affordance for MVP validation:

- expose a visible `Use demo account` style action on the login screen;
- source demo credentials from documented Vite-compatible demo configuration or an equivalent safe configuration boundary chosen in spec/design;
- submit demo credentials through the existing `useAuthSession().login()` / auth-session flow;
- keep InsForge calls behind the existing auth gateway/provider boundary;
- preserve linked-profile validation, active-profile validation, and non-empty `property_id` validation;
- handle missing demo configuration safely with disabled/hidden UI or non-secret explanatory copy;
- document the local/demo setup requirement: InsForge Auth user + active `profiles` row + associated property;
- add strict-TDD coverage for visible demo access, configured/missing demo credential behavior, and preservation of manual login behavior.

## Scope

In scope:

- login-screen UI changes needed to present demo access;
- auth-feature configuration helpers or constants needed to read demo credentials safely;
- `.env.example` placeholders for demo credential variables if config-based demo credentials are selected;
- concise setup documentation for preparing the demo Auth user/profile/property without committing secrets;
- i18n resource updates for new login/demo copy if the existing login UI remains localized;
- tests for the demo action, missing configuration behavior, successful login handoff, and no regression to manual login;
- OpenSpec spec/tasks/apply/verify artifacts in later phases.

## Acceptance Boundary

The change is acceptable when:

- users can discover a demo-login option from the login page;
- demo login uses the same real auth/session path as manual login;
- demo login cannot create or inject a fake `AppSession` in UI code;
- a successful demo login still requires a matching active profile and a valid `property_id`;
- missing demo configuration is safe, understandable, and does not leak secrets;
- documentation explains what backend demo data must exist;
- `npm run test:run` covers the new behavior during apply/verify;
- the implementation remains within the 400 changed-line review budget or tasks forecast a split before apply.

## Non-goals

Explicitly out of scope:

- public signup, self-service registration, invitations, or tenant onboarding;
- property/profile creation from the login screen;
- password reset, MFA, OAuth/social login, magic links, or user-management CRUD;
- fake local sessions, hardcoded `property_id` injection, or bypassing the auth/session provider;
- feature CRUD for properties, room types, rooms, guests, reservations, operations, billing, reports, or dashboard;
- creating production seed data or remote InsForge users as part of repository code;
- database schema changes, RLS/policy changes, Storage, realtime, or payment behavior;
- theme/language controls from issue #47;
- broad login-page redesign or new UI library installation.

## Affected Areas

Likely implementation areas for later phases:

- `src/features/auth/components/LoginForm.tsx` for the visible demo action;
- `src/features/auth/__tests__/LoginForm.test.tsx` or related auth tests for strict-TDD coverage;
- `src/features/auth/*` for a small demo-credentials configuration helper if design chooses one;
- `src/shared/i18n/resources/*` for localized demo-login labels and helper copy;
- `.env.example` for public demo credential placeholders if needed;
- `README.md`, `docs/*`, or a focused setup note if demo backend preparation needs documentation;
- `openspec/changes/enable-demo-login/` for SDD artifacts.

Exact file names and API shape should be finalized in spec/tasks before apply.

## Dependencies

- `openspec/specs/auth-session/spec.md` requires login through the approved auth boundary, linked profile resolution, active profile handling, and exactly one `property_id`.
- `openspec/specs/backend-environment/spec.md` requires Vite-compatible env naming and secret hygiene for frontend configuration.
- `openspec/specs/property-scoped-access/spec.md` requires property scope to derive from the authenticated session, not UI input.
- `docs/05-architecture.md` requires components not to call InsForge directly.
- A usable demo requires external backend preparation: an InsForge Auth user, a `profiles.auth_user_id` row for that user, active profile status, and a valid property.

## Risks and Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Demo credentials are mistaken for secrets | Treat any `VITE_*` demo credentials as public demo-only values; document that no real secret belongs in the repo or frontend bundle. |
| Demo login bypasses real auth/session validation | Route the demo action through the existing `login()` boundary and do not add fake session construction in UI code. |
| Missing backend demo user/profile makes the button appear broken | Document required setup clearly and handle authentication failure with existing safe error copy. |
| Missing demo env/config creates confusing UI | Define explicit disabled/hidden/error behavior in spec before apply. |
| Scope expands into signup/onboarding | Keep registration and property/profile creation out of scope; track those as future work if needed. |
| Auth UI changes exceed the review budget | Keep the UI minimal and forecast any split in tasks if estimated changes approach 400 lines. |
| Tests become brittle against InsForge SDK internals | Test via the existing auth provider/gateway boundary and user-visible behavior rather than SDK internals. |

## Rollback

Rollback should be feasible by reverting the demo-login UI, demo configuration helper, related i18n copy, documentation updates, and tests. Because this change should not create database schema, remote policies, or repository-managed seed data, no database rollback should be required.

If a local/demo InsForge Auth user or profile is created manually during validation, cleanup should be documented as an external environment step and not tied to source rollback.

## Success Criteria

- Login page presents a clear demo-access option for MVP validation.
- Demo access authenticates through the same real auth/session flow as manual email/password login.
- Active profile and `property_id` validation remain mandatory for protected app access.
- Missing configuration and auth failures remain safe and do not expose tokens, anon keys, JWTs, passwords, or raw backend payloads.
- Setup docs explain the required demo backend state without committing real credentials.
- Strict-TDD evidence is produced in later apply artifacts, with `npm run test:run` passing before verify.
- Issue #47 theme/language controls and public signup remain outside this change.

## Next Step

Proceed to SDD spec for `enable-demo-login`, defining exact requirements, scenarios, and acceptance criteria before implementation.
