# Tasks — enable-demo-login

## Apply Status

- [x] Task 1 — RED demo credential configuration helper tests
- [x] Task 2 — GREEN demo credential configuration helper
- [x] Task 3 — RED login form demo behavior tests
- [x] Task 4 — GREEN minimal demo action in login form
- [x] Task 5 — TRIANGULATE i18n copy for demo login states
- [x] Task 6 — TRIANGULATE env and setup documentation
- [x] Task 7 — REFACTOR auth boundaries and review scope
- [x] Task 8 — Final validation and SDD evidence

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 220–320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

## Scope Guardrails

- Keep this change limited to issue #48 demo login enablement.
- Do not add signup, onboarding, invitations, fake sessions, profile/property creation, theme/language controls, schema changes, RLS/policies, seed data, or new UI libraries.
- Demo login must call the existing `useAuthSession().login()` path and preserve linked-profile, active-profile, and `property_id` validation.
- Treat `VITE_*` demo credentials as public demo-only values, never as secrets.

## Implementation Tasks

### 1. RED — demo credential configuration helper tests

- Add failing tests in `src/features/auth/__tests__/demoCredentials.test.ts` for a small helper that resolves demo-login availability from explicit env-like input.
- Cover:
  - configured email/password returns an available credential object;
  - missing email, missing password, or blank values return an unavailable state;
  - returned unavailable state does not include raw credential values.
- Discovery target before writing implementation: confirm whether the helper should live under `src/features/auth/services/` or another existing auth boundary.
- Verification: run `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` if supported by the test runner, otherwise run `npm run test:run` and record the expected RED failure.
- Rollback boundary: remove only the new helper test file if this task is reverted.

### 2. GREEN — implement demo credential configuration helper

- Add `src/features/auth/services/demoCredentials.ts` or equivalent auth-scoped helper.
- Read defaults from `import.meta.env.VITE_DEMO_LOGIN_EMAIL` and `import.meta.env.VITE_DEMO_LOGIN_PASSWORD`, while allowing tests to pass explicit env-like input.
- Return a typed available/unavailable result; do not throw for missing demo configuration.
- Do not log, render, or expose demo passwords beyond the credential object passed to the login boundary.
- Verification: `npm run test:run` passes for the new helper tests.
- Rollback boundary: remove the helper and its test together.

### 3. RED — login form demo behavior tests

- Extend `src/features/auth/__tests__/LoginForm.test.tsx` before changing UI.
- Cover:
  - visible `Use demo account` affordance when demo credentials are configured;
  - clicking demo access calls the existing login boundary with configured demo credentials and triggers `onAuthenticated` on success;
  - missing demo configuration shows a disabled or safely unavailable demo action with non-secret explanatory copy;
  - manual email/password login still works;
  - UI-safe error behavior still avoids raw backend payloads or secrets.
- If needed, update the test render helper to pass demo-credential config into `LoginForm` as props instead of mutating global `import.meta.env`.
- Verification: run `npm run test:run` and record expected RED failures for missing UI/API.
- Rollback boundary: revert only the added/changed `LoginForm` tests.

### 4. GREEN — add minimal demo action to login form

- Update `src/features/auth/components/LoginForm.tsx` to present a distinct demo-login action.
- Prefer passing a resolved demo-credential result into the form or resolving it through the auth-scoped helper without creating InsForge clients in JSX.
- Demo action behavior:
  - configured: submits `{ email, password }` through the existing `login()` function;
  - missing config: disabled/hidden/safe-unavailable state per tests;
  - success: calls `onAuthenticated()` just like manual login;
  - failure: shows existing safe generic auth error or a safe demo-specific message.
- Keep manual login form behavior unchanged.
- Verification: `npm run test:run` passes for `LoginForm` coverage.
- Rollback boundary: revert `LoginForm.tsx`, associated test changes, and any helper wiring.

### 5. TRIANGULATE — i18n copy for demo login states

- Add English and Spanish keys in:
  - `src/shared/i18n/resources/en.ts`
  - `src/shared/i18n/resources/es.ts`
- Likely keys under `auth.login`:
  - demo action label;
  - demo unavailable helper text;
  - optional demo error/safe helper copy.
- Update tests to assert user-visible copy via role/name where practical instead of hardcoded internal keys.
- Verification: run `npm run test:run`; ensure existing i18n tests remain green.
- Rollback boundary: revert only the new i18n keys and dependent UI/test references.

### 6. TRIANGULATE — env and setup documentation

- Update `.env.example` with placeholder-only demo variables:
  - `VITE_DEMO_LOGIN_EMAIL=`
  - `VITE_DEMO_LOGIN_PASSWORD=`
- Add concise setup guidance in a focused existing doc, preferably `docs/04-tech-stack.md` or `README.md`, explaining:
  - frontend demo credentials are public demo-only values;
  - the InsForge Auth user must already exist;
  - `profiles.auth_user_id` must link to that auth user;
  - the profile must be `active` and reference a valid `property_id`;
  - no production credentials or real secrets should be committed.
- If a Spanish counterpart is changed for a numbered doc, update the `.es.md` counterpart too.
- Verification: documentation review confirms no real secrets and no claim that repo code provisions the external auth user.
- Rollback boundary: revert `.env.example` and the targeted doc updates.

### 7. REFACTOR — keep auth boundaries small and reviewable

- Review the diff for unnecessary broad UI redesign, duplicate login logic, fake session construction, hardcoded `property_id`, direct InsForge calls from components, or leaked env/password values.
- If helper or form code becomes large, extract only small pure functions inside `src/features/auth/services/demoCredentials.ts`; do not add a new architecture layer.
- Ensure implementation remains below the 400-line review budget; if projected diff exceeds 400 changed lines before docs, pause apply and ask for split approval.
- Verification: local diff inspection plus `npm run test:run`.
- Rollback boundary: refactor-only changes should be revertible without altering behavior.

### 8. Final validation and SDD evidence

- Run final validation commands:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`
- Record RED/GREEN/TRIANGULATE/REFACTOR evidence in `openspec/changes/enable-demo-login/apply.md` during apply.
- Confirm the OpenSpec deltas remain satisfied:
  - `openspec/changes/enable-demo-login/specs/auth-session/spec.md`
  - `openspec/changes/enable-demo-login/specs/backend-environment/spec.md`
- Confirm issue #47 theme/language controls remain untouched.
- Rollback boundary: because this change should not alter schema or remote backend state, rollback is source-only plus optional cleanup of any manually created external demo user/profile.

## Suggested Apply Order

1. Task 1 → Task 2: pure config helper RED/GREEN.
2. Task 3 → Task 4: login UI behavior RED/GREEN.
3. Task 5: localized copy triangulation.
4. Task 6: env/docs triangulation.
5. Task 7: refactor and boundary review.
6. Task 8: final validation and evidence.
