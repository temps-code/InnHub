# Proposal — add-i18n-foundation

## Executive Summary

Add a scalable internationalization foundation for InnHub using `i18next` and `react-i18next`, with English and Spanish resources for the current application shell only. This prepares the app for future Spanish/Rioplatense user-facing delivery while keeping issue #26 focused on infrastructure, conventions, and tests rather than translating unfinished business modules.

## Problem Statement

InnHub currently renders application shell copy directly in `src/app/App.tsx`. There is no locale configuration, translation resource structure, provider, language persistence, or testing convention for localized UI. If feature modules continue adding hardcoded copy, future translation work will become scattered, harder to review, and more expensive to retrofit.

## Intent

Create a small but future-ready i18n layer that future features can use consistently from the start. The implementation should make the current shell translatable in English and Spanish without adding a settings screen, broad product copy rewrites, or unrelated UI work.

## Goals

- Configure a React i18n foundation with `i18next` + `react-i18next`.
- Support English (`en`) and Spanish (`es`) as the initial locales.
- Keep the implementation ready for future namespaces, interpolation, pluralization, and validation messages.
- Move current app shell strings and planned module labels out of JSX and into translation resources.
- Provide a simple locale validation/persistence convention, likely using `localStorage` key `innhub.locale`.
- Establish test coverage for default locale behavior, locale switching mechanics, and translation rendering for the current shell.
- Keep SDD artifacts and implementation reviewable within the configured review budget.

## Non-Goals

- No full settings/preferences UI.
- No external UI component library.
- No complete business-module translation beyond the current shell and visible module labels.
- No backend persistence for language preferences.
- No routing or URL locale strategy unless a later phase explicitly needs it.
- No date, time, number, or currency localization beyond leaving space for future integration.
- No broad redesign of `src/app/App.tsx` or shared component extraction unless directly required for provider wiring/tests.

## Proposed Change

Use `i18next` and `react-i18next` as the project i18n foundation. Add a shared i18n module and wrap the app at the application provider boundary.

Recommended structure:

```text
src/
├── app/
│   └── providers/
│       └── AppProviders.tsx        # if provider composition is introduced
├── shared/
│   └── i18n/
│       ├── config.ts               # i18next initialization
│       ├── locales.ts              # supported locale constants and validation
│       ├── storage.ts              # localStorage read/write helper
│       ├── resources/
│       │   ├── en.ts
│       │   ├── es.ts
│       │   └── index.ts
│       └── test-utils.tsx          # optional render helper for i18n tests
└── main.tsx                        # provider mount point
```

Recommended behavior:

| Area            | Proposal                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Library         | Add `i18next` and `react-i18next` runtime dependencies.                                                       |
| Default locale  | Use English (`en`) as the default/fallback locale unless a valid stored preference exists.                    |
| Spanish variant | Use `es` resources with neutral/Rioplatense-friendly user-facing wording where applicable.                    |
| Persistence     | Store only validated locale values under `innhub.locale`. Ignore invalid stored values and fall back safely.  |
| Resource scope  | Translate current shell strings in `App.tsx`, including hero copy, foundation status copy, and module labels. |
| Provider        | Initialize i18n once and expose it through React at the top-level app boundary.                               |
| Tests           | Add unit/integration tests for locale validation/storage and rendered translations.                           |

## Scope

In scope for implementation:

- Install and configure `i18next` and `react-i18next`.
- Add English and Spanish translation resources for current app shell text.
- Replace hardcoded current shell strings with translation lookups.
- Add minimal locale constants/helpers and tests.
- Optionally add a small developer-facing convention note if implementation needs one.

Out of scope for implementation:

- Authentication, backend, database, or InsForge work.
- New business feature screens.
- A settings page or language switcher in navigation.
- Rewriting bilingual project documentation unless implementation adds a documented convention requiring both English and Spanish doc updates.

## Affected Areas

| Area                                   | Expected impact                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `package.json` / lockfile              | New i18n runtime dependencies.                                                              |
| `src/shared/i18n/`                     | New shared i18n configuration, resources, and helpers.                                      |
| `src/main.tsx` or `src/app/providers/` | App-level provider wiring.                                                                  |
| `src/app/App.tsx`                      | Replace hardcoded strings with `useTranslation` calls or translated resource-driven arrays. |
| Tests                                  | Add Vitest/Testing Library coverage for i18n behavior.                                      |
| Documentation                          | Optional concise convention note only if needed for maintainability.                        |

## Impact

This change creates a reusable localization boundary before larger InnHub modules are implemented. It reduces future hardcoded copy, supports the user's Spanish/Rioplatense delivery preference, and keeps translation mechanics outside business components. The dependency cost is small and justified by expected future needs such as interpolation, pluralization, validation messages, and namespace organization.

## Risks and Mitigations

| Risk                                              | Mitigation                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Scope creep into a full language settings feature | Keep UI switching out of scope; test switching through i18n APIs/helpers only.                                                   |
| Overengineering for the current small shell       | Limit resources to current visible copy while choosing a library that prevents future migration work.                            |
| Type safety gaps in translation keys              | Use structured resource files and consider typed key conventions in design/apply; avoid loose ad hoc dictionaries in components. |
| Invalid persisted locale breaks startup           | Validate stored values before applying them and fall back to `en`.                                                               |
| Spanish tone inconsistency                        | Keep copy concise and neutral/Rioplatense-friendly; avoid translating unfinished module content.                                 |
| React 19/library compatibility issues             | Confirm dependency compatibility during design/apply before implementation.                                                      |

## Alternatives Considered

| Alternative                                | Reason not preferred                                                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom typed dictionary only               | Lower dependency cost, but likely to be replaced once pluralization, interpolation, or module namespaces are needed. The user explicitly prefers a future-ready foundation. |
| Defer i18n until more modules exist        | Would allow hardcoded copy to spread into new modules and increase retrofit cost.                                                                                           |
| Full locale routing (`/es`, `/en`)         | Useful for public sites, but unnecessary for the current app shell and would expand routing scope.                                                                          |
| Browser-language auto-detection dependency | Convenient, but local deterministic fallback plus stored preference is enough for this issue. Detection can be added later if needed.                                       |

## Acceptance Gates

The next implementation phase should be accepted only if:

- `i18next` and `react-i18next` are configured once at the app boundary.
- Supported locales are centralized and invalid locale values fall back safely.
- Current shell copy and module labels render from translation resources, not inline string literals.
- English and Spanish resources exist for all moved shell keys.
- Tests cover default/fallback behavior and at least one Spanish rendering path.
- `npm run test:run` passes.
- `npm run lint` passes for TypeScript/React changes.
- `npm run build` passes before reporting implementation complete.
- No settings UI, business-module translation expansion, backend work, or external UI library is introduced.

## Rollback Plan

If the implementation causes build, test, or runtime issues, revert the i18n dependency additions, provider wiring, shared i18n module, and `App.tsx` translation lookup changes as a single reviewable unit. Because no data model or backend persistence is proposed, rollback should not require migrations or data cleanup. Any `localStorage` value under `innhub.locale` can be ignored safely by older code.

## Success Criteria

- Future InnHub UI work has a clear place to add localized strings.
- The current shell can render in both English and Spanish through the configured i18n layer.
- Translation concerns remain in `shared/i18n` and app/provider boundaries, not scattered across JSX.
- The issue stays small enough for a focused PR under the 400 changed-line review budget.

## Next Phase Recommendation

Proceed to SDD spec/design for `add-i18n-foundation` with the dependency-based approach (`i18next` + `react-i18next`). The design phase should pin the exact file structure, resource typing strategy, storage helper behavior, and test plan before implementation.

## References

- Issue: https://github.com/temps-code/InnHub/issues/26
- Explore artifact: `openspec/sdd-explore-add-i18n-foundation.md`
- Architecture reference: `docs/05-architecture.md`
- Tech stack reference: `docs/04-tech-stack.md`
