# SDD Design Result — add-i18n-foundation

Status: success

## Executive Summary

Designed the InnHub i18n foundation for issue #26 using `i18next` + `react-i18next`. The design keeps scope limited to current app shell copy and module labels, adds a stable app provider boundary, centralizes locale validation/storage/resource conventions under `src/shared/i18n`, and forecasts the implementation as small enough for the 400 changed-line review budget if scope is controlled.

## Artifacts

- Primary design artifact: `openspec/changes/add-i18n-foundation/design.md`
- Source inputs reviewed:
  - `openspec/config.yaml`
  - `openspec/changes/add-i18n-foundation/proposal.md`
  - `openspec/sdd-explore-add-i18n-foundation.md`
  - `src/main.tsx`
  - `src/app/App.tsx`
  - `src/index.css`
  - `package.json`
  - `package-lock.json`
  - `docs/04-tech-stack.md`
  - `docs/05-architecture.md`
- Skill loaded: `/home/temps/.config/opencode/skills/cognitive-doc-design/SKILL.md`

## Key Decisions

| Area            | Decision                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Library         | Use `i18next` + `react-i18next` as directed.                                                                |
| Provider        | Add `src/app/providers/AppProviders.tsx` and wrap `<App />` from `src/main.tsx`.                            |
| Resources       | Add `src/shared/i18n/resources/{en.ts,es.ts,index.ts}` with one initial `app` namespace.                    |
| Keys            | Use nested lower camelCase keys such as `hero.eyebrow`, `foundation.title`, and `modules.items.properties`. |
| Locale contract | Centralize `SUPPORTED_LOCALES = ["en", "es"]`, `Locale`, `DEFAULT_LOCALE = "en"`, and `isSupportedLocale`.  |
| Storage         | Use `innhub.locale`; return `null` for missing/invalid/unavailable storage and catch storage errors.        |
| Testing         | Add unit tests for locale/storage helpers and rendering tests for English and Spanish shell copy.           |
| Compatibility   | During apply, install with npm and verify React 19 peer compatibility; do not force peer overrides.         |

## Next Recommended

Proceed to SDD tasks/apply for `add-i18n-foundation` using the design artifact. During apply, run:

```bash
npm install i18next react-i18next
npm run lint
npm run test:run
npm run build
```

Pause before implementation if npm reports React 19 peer dependency conflicts or if changed-line forecast exceeds 400 lines.

## Risks

- `react-i18next` peer compatibility with React 19 must be verified after npm resolution.
- Lockfile churn could push the changed-line budget above 400 lines.
- Tests that mutate the global i18n instance can leak language state unless reset between cases.
- Scope creep into a settings UI or full module translations must remain out of scope.

## Memory / Persistence

Engram memory tools were not available in this subagent toolset, so no Engram summary was saved. The OpenSpec artifacts above were written successfully.

## Skill Resolution

paths-injected
