# Tasks — add-i18n-foundation

## Review Workload Forecast

| Field                   | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| Estimated changed lines | 300–420                                                   |
| 400-line budget risk    | Medium                                                    |
| Chained PRs recommended | No                                                        |
| Suggested split         | Single PR; monitor lockfile/test churn before PR creation |
| Delivery strategy       | single-pr                                                 |
| Chain strategy          | pending                                                   |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Work Units

### 1. RED — Locale policy tests

- [x] Add failing tests in `src/shared/i18n/__tests__/locales.test.ts` for `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, and `isSupportedLocale`.
- [x] Cover accepted values `en` and `es`, and rejected values `pt`, `en-US`, empty string, `null`, and object values.
- [x] Run `npm run test:run` and confirm this fails because `src/shared/i18n/locales.ts` does not exist yet.

### 2. GREEN — Locale policy implementation

- [x] Create `src/shared/i18n/locales.ts` with centralized `SUPPORTED_LOCALES`, `Locale`, `DEFAULT_LOCALE`, and `isSupportedLocale`.
- [x] Run `npm run test:run` and confirm locale tests pass.
- [x] Rollback boundary: remove `src/shared/i18n/locales.ts` and its tests only.

### 3. RED — Locale storage tests

- [x] Add failing tests in `src/shared/i18n/__tests__/storage.test.ts` for `LOCALE_STORAGE_KEY`, `getStoredLocale`, and `setStoredLocale`.
- [x] Test missing values, valid `en`/`es`, invalid persisted values, read/write failures, and writes to `innhub.locale`.
- [x] Use an in-memory `Storage` test double; do not rely on global browser state.
- [x] Run `npm run test:run` and confirm this fails because `src/shared/i18n/storage.ts` does not exist yet.

### 4. GREEN — Locale storage helper

- [x] Create `src/shared/i18n/storage.ts` that reads/writes only validated `Locale` values under `innhub.locale`.
- [x] Catch storage read/write errors and return `null` or no-op as designed.
- [x] Keep storage independent from `i18n.changeLanguage`.
- [x] Run `npm run test:run` and confirm storage tests pass.
- [x] Rollback boundary: remove `storage.ts` and its tests only.

### 5. RED — App i18n rendering tests

- [x] Add failing render tests in `src/app/__tests__/App.i18n.test.tsx` for default English shell rendering through an i18n provider.
- [x] Add a Spanish rendering test that switches language through an i18n instance/API and checks at least one hero/foundation string plus one module label.
- [x] Add fallback coverage for an invalid stored locale resolving to English through the shared initialization path or a test-local equivalent.
- [x] Run `npm run test:run` and confirm tests fail because i18n dependencies/config/resources/provider do not exist yet.

### 6. GREEN — Install and configure i18n foundation

- [x] Run `npm install i18next react-i18next` to update `package.json` and `package-lock.json`.
- [x] If npm reports React 19 peer dependency conflicts, stop apply and request a dependency/version decision; do not use forced install flags.
- [x] Create translation resources:
  - `src/shared/i18n/resources/en.ts`
  - `src/shared/i18n/resources/es.ts`
  - `src/shared/i18n/resources/index.ts`
- [x] Include current app shell hero copy, foundation status copy, `modules.ariaLabel`, and module labels for properties, rooms, guests, reservations, operations, billing, and reports.
- [x] Type Spanish resources to satisfy the English resource shape.
- [x] Create `src/shared/i18n/config.ts` with one `app` namespace, `DEFAULT_LOCALE` fallback, `SUPPORTED_LOCALES`, stored-locale initialization, and `interpolation.escapeValue: false`.
- [x] Create `src/app/providers/AppProviders.tsx` using `I18nextProvider` and the configured `i18n` instance.
- [x] Update `src/main.tsx` to wrap `<App />` in `<AppProviders>`.
- [x] Run `npm run test:run` and confirm the new i18n tests now compile and progress to component assertions.
- [x] Rollback boundary: revert dependency additions, provider wiring, `config.ts`, and resources as one unit.

### 7. GREEN — Move app shell copy to translations

- [x] Update `src/app/App.tsx` to import `useTranslation` from `react-i18next` and call `const { t } = useTranslation()`.
- [x] Replace hardcoded user-facing shell strings with translation keys from the `app` namespace.
- [x] Replace the current translated-text module array with stable module keys and render `modules.items.<key>` values.
- [x] Keep layout, class names, `id` values, decorative logo `alt=""`, and `aria-hidden="true"` unchanged.
- [x] Translate the module list `aria-label` through `modules.ariaLabel`.
- [x] Run `npm run test:run` and confirm English and Spanish rendering tests pass.
- [x] Rollback boundary: restore `src/app/App.tsx` hardcoded strings and remove provider/resource dependencies from the shell.

### 8. TRIANGULATE — Resource completeness and fallback behavior

- [x] Extend or adjust tests only as needed to prove all visible module labels are resource-backed in English and Spanish.
- [x] Confirm invalid persisted values do not throw during i18n initialization and fall back to English.
- [x] Confirm tests do not depend on a settings screen, language switcher, backend persistence, or locale routes.
- [x] Run `npm run test:run` after test triangulation.

### 9. REFACTOR — Keep the foundation small and reviewable

- [x] Remove duplicated test setup only if it improves clarity; create `src/test/render.tsx` only if multiple tests need the same provider helper.
- [x] Keep i18n files under `src/shared/i18n/` and provider composition under `src/app/providers/`.
- [x] Do not add documentation, UI components, routing changes, backend calls, or external UI libraries unless a failing acceptance gate requires it.
- [x] Check `git diff --stat`; if changed lines appear likely to exceed 400, pause before PR creation and ask for a chained delivery decision.

### 10. Final verification

- [x] Run `npm run lint`.
- [x] Run `npm run test:run`.
- [x] Run `npm run build`.
- [x] Manually inspect changed files for scope: no settings UI, no locale routing, no backend persistence, no unrelated module UI work.
- [x] Suggested work-unit commit story if committing is later approved:
  - `feat(i18n): add locale validation and storage helpers`
  - `feat(i18n): configure app translation provider and resources`
  - `feat(app): render shell copy from translations`

## Acceptance Checklist

- [x] `i18next` and `react-i18next` are installed without forced peer overrides.
- [x] I18n is initialized once at the app boundary.
- [x] `en` and `es` are centralized, with `en` as default and fallback.
- [x] Invalid `innhub.locale` values fall back safely to English.
- [x] Current app shell copy and module labels render from resources outside JSX.
- [x] English and Spanish resources have matching keys.
- [x] Tests cover locale validation, storage behavior, English rendering, Spanish rendering, and invalid persisted locale fallback.
- [x] `npm run lint`, `npm run test:run`, and `npm run build` pass.
