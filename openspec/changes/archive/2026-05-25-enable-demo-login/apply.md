# Apply Progress — enable-demo-login

## Summary

Implemented issue #48 demo login enablement with strict TDD. The login form now exposes a visible demo-account action, routes configured demo credentials through the existing `login()` auth-session boundary, preserves manual email/password login, and shows a safe disabled state when demo credentials are not configured.

## Completed Tasks

- [x] RED — Added demo credential helper tests before implementation.
- [x] GREEN — Implemented `resolveDemoCredentials()` in the auth service boundary.
- [x] RED — Added login form demo behavior tests before UI changes.
- [x] GREEN — Added minimal `Use demo account` action to `LoginForm`.
- [x] TRIANGULATE — Added English and Spanish i18n copy for demo login states.
- [x] TRIANGULATE — Added `.env.example` placeholders and bilingual setup documentation.
- [x] REFACTOR — Kept demo logic within auth boundaries and avoided fake sessions/direct InsForge calls in JSX.
- [x] Final validation — Ran tests, lint, and build.

## Files Changed

- `.env.example` — added public demo credential placeholders.
- `docs/04-tech-stack.md` — added demo auth setup and public-credential hygiene guidance.
- `docs/04-tech-stack.es.md` — Spanish counterpart for demo auth setup guidance.
- `src/features/auth/__tests__/demoCredentials.test.ts` — new strict-TDD coverage for demo credential config resolution.
- `src/features/auth/services/demoCredentials.ts` — new auth-scoped helper for resolving configured demo credentials safely.
- `src/features/auth/__tests__/LoginForm.test.tsx` — coverage for demo login action, unavailable state, and manual login preservation.
- `src/features/auth/components/LoginForm.tsx` — added demo login button and shared credential submission path.
- `src/shared/i18n/resources/en.ts` — English demo login copy.
- `src/shared/i18n/resources/es.ts` — Spanish demo login copy.
- `openspec/changes/enable-demo-login/tasks.md` — marked apply tasks complete.
- `openspec/changes/enable-demo-login/apply.md` — this apply evidence.

## TDD Cycle Evidence

| Cycle | Phase | Test / Command | Result | Evidence |
| ----- | ----- | -------------- | ------ | -------- |
| Demo credential helper | RED | `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` | Failed as expected | Missing `../services/demoCredentials` module before implementation. |
| Demo credential helper | GREEN | `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` | Passed | 1 test file, 6 tests passed after adding `resolveDemoCredentials()`. |
| Login form demo behavior | RED | `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx` | Failed as expected | New tests could not find the `Use demo account` button before UI implementation. |
| Login form demo behavior | GREEN/TRIANGULATE | `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/features/auth/__tests__/demoCredentials.test.ts` | Passed | 2 test files, 11 tests passed after UI and i18n copy were added. |
| Full suite | REFACTOR/VERIFY | `npm run test:run` | Passed | 18 test files, 109 tests passed. |
| Quality | VERIFY | `npm run lint` | Passed | ESLint completed without errors. |
| Build | VERIFY | `npm run build` | Passed with existing Vite chunk-size warning | TypeScript build and Vite production build completed successfully. |

## Test Commands Run

- `npm run test:run -- src/features/auth/__tests__/demoCredentials.test.ts` — RED failure, then GREEN pass.
- `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx` — RED failure for missing demo UI.
- `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/features/auth/__tests__/demoCredentials.test.ts` — GREEN/TRIANGULATE pass.
- `npm run test:run` — final pass.
- `npm run lint` — final pass.
- `npm run build` — final pass; Vite reported a chunk larger than 500 kB as a warning.

## Deviations From Design

- No separate design artifact was needed; proposal/spec/tasks were sufficient for this bounded apply.
- The demo unavailable state is always visible as a disabled button plus safe helper text when config is missing. This satisfies the spec option to hide, disable, or safely reject unavailable demo access.
- Demo credential helper trims the demo password. This intentionally treats blank/whitespace-only values as unavailable and keeps configured credentials minimal for the login boundary.

## Boundary Review

- Demo login calls the existing `login()` function from `useAuthSession()`; it does not create a fake `AppSession`.
- `LoginForm` does not create an InsForge client or call InsForge APIs directly.
- No hardcoded `property_id` was added.
- Manual email/password login remains supported.
- No signup/onboarding, theme/language controls, feature CRUD, schema/RLS/policy, seed data, or UI library changes were added.
- Demo credentials are documented as public demo-only Vite frontend values, not secrets.

## Remaining Tasks

- None for apply.
- External environment setup remains required before manual demo login can succeed: create/configure the InsForge Auth user, matching active `profiles.auth_user_id`, and valid `property_id`.

## Workload / PR Boundary

- Delivery strategy: single PR.
- Review budget: 400 changed lines.
- Forecast risk: Low.
- Actual source/docs implementation stayed within the budget. OpenSpec planning artifacts were pre-existing from the SDD planning phase and should be reviewed as SDD artifacts.
