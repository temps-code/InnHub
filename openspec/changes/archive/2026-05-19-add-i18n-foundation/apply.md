# Apply Progress — add-i18n-foundation

## Status

completed

## Completed Tasks

- Installed `i18next` and `react-i18next` without forced peer overrides.
- Added centralized locale policy in `src/shared/i18n/locales.ts`.
- Added safe locale persistence helpers in `src/shared/i18n/storage.ts` using `innhub.locale`.
- Added English and Spanish app-shell translation resources under `src/shared/i18n/resources/`.
- Added i18next configuration in `src/shared/i18n/config.ts` with one `app` namespace, English fallback, supported locales, and safe stored-locale initialization.
- Added `src/app/providers/AppProviders.tsx` and wrapped `<App />` from `src/main.tsx`.
- Migrated current app shell copy and module labels in `src/app/App.tsx` to translation lookups.
- Added unit and integration tests for locale validation, storage behavior, default English rendering, Spanish rendering, and invalid persisted locale fallback.
- Updated `openspec/changes/add-i18n-foundation/tasks.md` checkboxes.

## Files Changed

- `package.json`
- `package-lock.json`
- `src/app/App.tsx`
- `src/main.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/app/__tests__/App.i18n.test.tsx`
- `src/shared/i18n/config.ts`
- `src/shared/i18n/locales.ts`
- `src/shared/i18n/storage.ts`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `src/shared/i18n/resources/index.ts`
- `src/shared/i18n/__tests__/locales.test.ts`
- `src/shared/i18n/__tests__/storage.test.ts`
- `openspec/changes/add-i18n-foundation/tasks.md`

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Locale policy | `src/shared/i18n/__tests__/locales.test.ts` | Unit | ✅ Baseline `npm run test:run`: 0 tests, no failures | ✅ Failed: missing `../locales` | ✅ `7 passed` after `locales.ts` | ✅ Accepts `en`/`es`; rejects `pt`, `en-US`, empty, `null`, object | ✅ Pure helper kept minimal |
| Locale storage | `src/shared/i18n/__tests__/storage.test.ts` | Unit | ✅ Locale tests green before storage work | ✅ Failed: missing `../storage` | ✅ `15 passed` after `storage.ts` | ✅ Valid, missing, invalid, throwing read, write, and throwing write paths covered | ✅ Test helper compressed; storage helper remains independent from i18n |
| App i18n rendering | `src/app/__tests__/App.i18n.test.tsx` | Integration | ✅ Logic tests green before component work | ✅ Failed: missing `react-i18next` / provider / config | ✅ `3 passed` after dependencies, provider, resources, config, and App migration | ✅ English and Spanish tests cover all current module labels; invalid persisted locale falls back to English | ✅ No shared render helper extracted; kept tests local to avoid extra surface |

## Test Commands Run

- `npm run test:run` — baseline: no tests found, exit 0.
- `npm run test:run -- src/shared/i18n/__tests__/locales.test.ts` — RED failed on missing `../locales`.
- `npm run test:run -- src/shared/i18n/__tests__/locales.test.ts` — GREEN: 1 file passed, 7 tests passed.
- `npm run test:run -- src/shared/i18n/__tests__/storage.test.ts` — RED failed on missing `../storage`.
- `npm run test:run -- src/shared/i18n/__tests__/locales.test.ts src/shared/i18n/__tests__/storage.test.ts` — GREEN: 2 files passed, 15 tests passed.
- `npm run test:run -- src/app/__tests__/App.i18n.test.tsx` — RED failed on missing `react-i18next` / app provider / config.
- `npm run test:run -- src/app/__tests__/App.i18n.test.tsx` — GREEN: 1 file passed, 3 tests passed.
- `npm run test:run` — final: 3 files passed, 17 tests passed.
- `npm run lint` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.
- `npm ls i18next react-i18next --depth=0` — `i18next@26.2.0`, `react-i18next@17.0.8`.
- `node -e "const p=require('./node_modules/react-i18next/package.json'); console.log(JSON.stringify(p.peerDependencies))"` — React peer `>= 16.8.0`, compatible with React 19.

## Verification

- `npm run lint` ✅
- `npm run test:run` ✅ (`17 passed`)
- `npm run build` ✅
- `git diff --check` ✅
- Dependency peer check ✅ (`react-i18next` supports `react >= 16.8.0`)

## Deviations From Design

- `createI18nInstance()` was exported from `src/shared/i18n/config.ts` to support isolated fallback initialization in tests while keeping production initialization single-instance via exported `i18n`.
- App rendering tests use a test-local memory `localStorage` shim because Vitest/jsdom reported localStorage unavailable without a `--localstorage-file` option. Production storage helpers still catch unavailable storage and fall back safely.
- No `src/test/render.tsx` helper was created; tests stayed local because only one integration test file needed provider setup.

## Remaining Tasks

None for apply. Issue #26 is ready for review/verify.

## Workload / PR Boundary

- Implementation excluding lockfile and OpenSpec artifacts: `368 insertions + 23 deletions = 391 changed lines`.
- Implementation including lockfile: `444 insertions + 25 deletions = 469 changed lines`.
- Risk status: within the 400-line review budget when lockfile churn is noted separately, as planned by tasks/design. No chained PR split is recommended.

## Memory Persistence

Engram memory tools were not available in this subagent runtime, so implementation findings were recorded in this OpenSpec apply artifact instead.
