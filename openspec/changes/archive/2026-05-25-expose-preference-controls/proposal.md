# Proposal: Expose Theme and Language Controls

## Intent

Users have no way to switch language or theme from the UI. The i18n infrastructure and CSS theme variables exist but lack user-facing controls. This change closes Issue #47 by adding toggle controls for both preferences, reachable from every page surface.

## Scope

### In Scope
- `useTheme` hook: manage `data-theme` attribute, persist to `innhub.theme`, detect `prefers-color-scheme` on first load
- `useLocale` hook: wrap `i18n.changeLanguage()` + `setStoredLocale()`
- `ThemeToggle` atom + `LanguageToggle` atom
- `PreferenceBar` molecule composing both toggles
- Mount in `TopBar` (authenticated), `LoginPage`, `PublicHomePage` (public)
- Translation keys for toggle labels/aria in `en.ts` and `es.ts`
- Unit tests for hooks and toggle components

### Out of Scope
- New localization frameworks or rewriting i18n resources
- Full user settings/preferences module or page
- Backend persistence of preferences
- System theme live-listener (beyond initial OS detection)
- FOUC prevention via inline `<script>` in `index.html` (deferred to future)

## Capabilities

### New Capabilities
- `theme-management`: Read/write `data-theme` on `<html>`, persist to localStorage (`innhub.theme`), resolve initial theme via localStorage → `prefers-color-scheme` → `"light"`
- `theme-toggle-ui`: Accessible icon button toggling light ↔ dark with `aria-label`
- `locale-toggle-ui`: Accessible toggle switching between `en` and `es` with visual indicator of current locale
- `preference-bar`: Reusable molecule composing theme + locale toggles, mountable in any layout context

### Modified Capabilities
- `i18n/no-settings-ui`: The existing i18n spec explicitly prohibits settings UI (Requirement: No User Settings UI). This change **supersedes** that constraint for locale switching only — adding a minimal toggle, not a settings page.
- `shared-ui/atoms`: New `ThemeToggle` and `LanguageToggle` atoms added to shared component exports
- `shared-ui/molecules`: New `PreferenceBar` molecule added to shared component exports

## Approach

**Hook + Atom Composition** (from exploration recommendation):

1. **Hooks layer** (`shared/hooks/`): `useTheme` manages DOM + localStorage; `useLocale` wraps existing i18n APIs. No providers needed — theme is global DOM state, locale already has `I18nextProvider`.
2. **Atoms** (`shared/components/atoms/`): `ThemeToggle` and `LanguageToggle` — small, accessible buttons using existing `Button` atom patterns.
3. **Molecule** (`shared/components/molecules/`): `PreferenceBar` — flex container composing both toggles.
4. **Integration**: Drop `PreferenceBar` into `TopBar` right section and fixed/absolute position in `LoginPage`/`PublicHomePage` top-right.
5. **Theme storage**: Follow `innhub.locale` convention → `innhub.theme` key, values `"light" | "dark"`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/hooks/useTheme.ts` | New | Theme state management hook |
| `src/shared/hooks/useLocale.ts` | New | Locale switching hook |
| `src/shared/components/atoms/ThemeToggle.tsx` | New | Dark/light toggle button |
| `src/shared/components/atoms/LanguageToggle.tsx` | New | EN/ES toggle button |
| `src/shared/components/molecules/PreferenceBar.tsx` | New | Composed preference controls |
| `src/shared/components/atoms/index.ts` | Modify | Export new atoms |
| `src/shared/components/molecules/index.ts` | Modify | Export new molecule |
| `src/app/shell/TopBar.tsx` | Modify | Add PreferenceBar to right section |
| `src/app/pages/LoginPage.tsx` | Modify | Add PreferenceBar (top-right) |
| `src/app/pages/PublicHomePage.tsx` | Modify | Add PreferenceBar (top-right) |
| `src/shared/i18n/resources/en.ts` | Modify | Add toggle label/aria keys |
| `src/shared/i18n/resources/es.ts` | Modify | Add toggle label/aria keys |
| 4 test files | New | Hook + component tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| FOUC on dark theme (light flash before React hydrates) | Medium | Accept for MVP; document inline-script approach for future |
| i18n spec conflict (`No User Settings UI`) | Certain | Spec update: supersede that single requirement; toggle ≠ settings page |
| Accessibility gaps on toggles | Low | Require `aria-label`, `aria-pressed`, keyboard support; test with assertions |
| Barrel export ordering breaks | Low | Add exports alphabetically; verify build passes |

## Rollback Plan

All changes are additive new files + small insertions in 3 existing pages + 2 barrel exports. Rollback = revert the commit:
1. Delete new hook/component/test files
2. Remove `PreferenceBar` usage from `TopBar`, `LoginPage`, `PublicHomePage`
3. Remove new translation keys from `en.ts`/`es.ts`
4. Remove barrel export lines

No database, backend, or breaking API changes involved.

## Dependencies

- Existing `i18next` + `react-i18next` setup (already in place)
- Existing CSS `data-theme` variables in `index.css` (already in place)
- Existing `Button` atom for toggle styling reference (already in place)
- Existing localStorage utilities in `shared/i18n/storage.ts` (pattern reference)

## Success Criteria

- [ ] `useTheme` persists theme to `innhub.theme` and sets `data-theme` attribute
- [ ] `useTheme` resolves initial theme: localStorage → `prefers-color-scheme` → `"light"`
- [ ] `useLocale` switches language and persists via existing i18n storage
- [ ] `ThemeToggle` and `LanguageToggle` are accessible (aria-label, keyboard operable)
- [ ] `PreferenceBar` is visible in TopBar, LoginPage, and PublicHomePage
- [ ] Theme and locale choices survive page reload
- [ ] All new translation keys exist in both `en.ts` and `es.ts`
- [ ] `npm run test:run`, `npm run lint`, `npm run build` pass
- [ ] i18n spec updated to remove/supersede "No User Settings UI" constraint
