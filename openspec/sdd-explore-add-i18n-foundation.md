# SDD Explore — add-i18n-foundation

## Status

partial_success

## Executive Summary

Explore completed for issue #26. InnHub has no existing i18n setup. The current app shell copy is hardcoded in `src/app/App.tsx`, and `src/main.tsx` mounts `<App />` directly. `package.json` has no i18n dependency. Tailwind is already configured via `@import "tailwindcss"` in `src/index.css`.

## Issue

- GitHub issue: https://github.com/temps-code/InnHub/issues/26
- Title: `feat(i18n): add English and Spanish localization foundation`
- Change id: `add-i18n-foundation`

## Recommended Foundation

Use a lightweight custom typed i18n layer for the current scope, avoiding a new dependency while the app only needs simple static copy.

Suggested structure:

```text
src/shared/i18n/
├── I18nProvider.tsx
├── locales.ts
├── useI18n.ts
└── resources/
    ├── en.ts
    ├── es.ts
    └── index.ts
```

Recommended behavior:

- Default locale: `en`.
- Secondary locale: `es`.
- Persist future preference with a validated `localStorage` key such as `innhub.locale`.
- Do not require a full settings screen in this issue.
- Wrap the app at an app-level initialization point, likely `src/main.tsx` or a provider composition under `src/app/providers`.
- Move current shell strings and module labels from `src/app/App.tsx` into translation resources.
- Keep dictionaries outside JSX components.
- Add a short convention doc section if needed.

## Risks

- If future requirements need pluralization, interpolation, date/number formatting, or async namespace loading, the custom approach may need to evolve or be replaced by a library such as `i18next` / `react-i18next`.
- Adding a full language switcher UI now could bleed into shared UI/component work and should stay out of scope unless explicitly approved.
- The implementation should avoid hardcoding dictionaries in JSX components, otherwise #22 will inherit the wrong pattern.

## Next Recommended

Proceed to proposal/spec/design for `add-i18n-foundation`.

Decision to confirm during design:

- custom typed i18n layer for this MVP slice; or
- dependency-based i18n via `i18next` / `react-i18next`.

## Skill Resolution

paths-injected
