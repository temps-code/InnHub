## Review

I did **not** write `/openspec/review-add-i18n-foundation.md` because the task also says **do not edit files or run mutating commands**. No Engram tools are available in this runtime, so I could not save memory.

## Approval status

**Not approved for commit/PR yet.** Implementation is mostly correct, but I found blockers that should be fixed/reconciled before commit.

## Blocker

- **Storage fallback can still throw before the helper catch block.**  
  In `src/shared/i18n/storage.ts:6-8` and `:18-21`, the default parameter reads `globalThis.localStorage` before entering the function body:
  - `storage: Storage | undefined = globalThis.localStorage`
  If accessing `localStorage` itself throws, the `try/catch` at `src/shared/i18n/storage.ts:9-15` / `:22-26` will not catch it. `createI18nInstance()` calls `getStoredLocale()` during startup at `src/shared/i18n/config.ts:17`, so app initialization can fail in storage-restricted environments. This conflicts with the intended safe fallback behavior recorded in SDD verify/archive.

- **SDD summary artifacts are inconsistent/stale.**  
  `openspec/changes/archive/2026-05-19-add-i18n-foundation/verify.md:20` correctly says final tests are `18 passed`, and `:46-48` records the persisted Spanish assertion.  
  But `openspec/sdd-verify-add-i18n-foundation.md:25-28`, `:53`, and `:63-65` still report `17 tests`, claim the persisted Spanish test is missing, and say verify was “inline only / not written” even though the file exists. If these root SDD artifacts are committed, the PR will contain contradictory verification evidence.

## Correct

- `i18next` and `react-i18next` are installed in `package.json:16-23`; `npm ls` confirms `i18next@26.2.0` and `react-i18next@17.0.8`.
- App boundary is clean: `src/main.tsx:5-11` wraps `<App />` in `AppProviders`, and `src/app/providers/AppProviders.tsx:10-11` owns the `I18nextProvider`.
- Locale policy is centralized: `src/shared/i18n/locales.ts:1-11` defines `en`, `es`, default `en`, and validation.
- Translation resources are outside JSX and cover current shell/module labels:
  - English: `src/shared/i18n/resources/en.ts:1-26`
  - Spanish: `src/shared/i18n/resources/es.ts:3-28`
- `App` renders translation keys rather than inline dictionaries: `src/app/App.tsx:28-70`.
- Tests cover default English, Spanish active language, persisted Spanish, invalid persisted fallback, locale validation, and storage helpers:
  - `src/app/__tests__/App.i18n.test.tsx:58-115`
  - `src/shared/i18n/__tests__/storage.test.ts:39-66`
- No scope creep found: no settings UI, language switcher, locale routing, backend persistence, or unrelated module UI.

## OpenSpec/archive consistency

- Canonical and archived i18n specs match exactly: `diff -u openspec/changes/archive/.../specs/i18n/spec.md openspec/specs/i18n/spec.md` produced no output.
- No active non-archived i18n change remains under `openspec/changes`.
- Archive report records successful sync and no destructive merge: `openspec/changes/archive/2026-05-19-add-i18n-foundation/archive-report.md`.

## Verification evidence

Commands run:

- `git diff --check` ✅
- `npm ls i18next react-i18next --depth=0` ✅
- `npm run lint` ✅
- `npm run test:run` ✅ — 3 files, 18 tests passed
- `npm run build` ✅

Warnings only:

- Node `DEP0205`
- Vitest experimental `localStorage` warning

## Non-blocking suggestions

- After fixing the storage default-parameter issue, add a test that simulates a throwing `globalThis.localStorage` getter, not only an injected throwing `Storage`.
- Reconcile or omit stale root `openspec/sdd-*` summaries before PR so reviewers see one consistent source of verification truth.