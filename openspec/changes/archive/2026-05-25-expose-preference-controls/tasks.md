# Tasks: Expose Preference Controls

## Review Workload Forecast
| Field | Value |
|-------|-------|
| Estimated changed lines | 550 lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1: Hooks & translations, PR2: UI Atoms & Molecule, PR3: Shell Mounting |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Phase 1: Foundation (State, Hooks & Translations)
- [x] 1.1 RED: Write `src/shared/hooks/__tests__/useTheme.test.ts` to test initial theme resolution (localStorage, matchMedia, fallback) and toggling.
- [x] 1.2 GREEN: Implement `src/shared/hooks/useTheme.ts` to pass the tests, managing `data-theme` on the `html` element.
- [x] 1.3 RED: Write `src/shared/hooks/__tests__/useLocale.test.ts` verifying adapter integration with i18n changeLanguage and localStorage.
- [x] 1.4 GREEN: Implement `src/shared/hooks/useLocale.ts` wrapping i18next and syncing locale to `innhub.locale`.
- [x] 1.5 REFACTOR: Run `npm run lint` and `npm run test:run` on hooks. Export from `src/shared/hooks/index.ts`.
- [x] 1.6 Update translations in `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts` with labels for toggles.

## Phase 2: UI Atoms & Molecules
- [x] 2.1 RED: Write unit tests `src/shared/components/atoms/__tests__/ThemeToggle.test.tsx` verifying aria-labels and SVG icons.
- [x] 2.2 GREEN: Implement `src/shared/components/atoms/ThemeToggle.tsx` and export from `src/shared/components/atoms/index.ts`.
- [x] 2.3 RED: Write unit tests `src/shared/components/atoms/__tests__/LanguageToggle.test.tsx` verifying interactive click state.
- [x] 2.4 GREEN: Implement `src/shared/components/atoms/LanguageToggle.tsx` and export from `src/shared/components/atoms/index.ts`.
- [x] 2.5 RED: Write unit tests `src/shared/components/molecules/__tests__/PreferenceBar.test.tsx` for layout composition.
- [x] 2.6 GREEN: Implement `src/shared/components/molecules/PreferenceBar.tsx` and export from `src/shared/components/molecules/index.ts`.


## Phase 3: Integration & Shell Mounting
- [x] 3.1 RED: Write integration test verifying PreferenceBar visibility on pages and within TopBar.
- [x] 3.2 GREEN: Modify `src/app/shell/TopBar.tsx` to render `PreferenceBar` in the rightmost flex area.
- [x] 3.3 GREEN: Modify `src/app/pages/LoginPage.tsx` to mount `PreferenceBar` absolutely positioned in the top-right.
- [x] 3.4 GREEN: Modify `src/app/pages/PublicHomePage.tsx` to mount `PreferenceBar` absolutely positioned in the top-right.
- [x] 3.5 REFACTOR: Run `npm run build`, `npm run lint`, and `npm run test:run` to ensure all 3 PR slices are green and fully linted.
