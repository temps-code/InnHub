# SDD Proposal — add-i18n-foundation

## Status

success

## Executive Summary

Proposal completed for issue #26. The recommended path is to add a scalable i18n foundation with `i18next` and `react-i18next`, limited to current app shell copy and module labels. This intentionally supersedes the explore artifact's custom-dictionary recommendation because the user explicitly prefers a future-ready foundation.

## Artifact

Primary proposal written to:

- `openspec/changes/add-i18n-foundation/proposal.md`

## Summary

| Topic                   | Decision                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Change id               | `add-i18n-foundation`                                                                               |
| Library strategy        | Use `i18next` + `react-i18next`.                                                                    |
| Initial locales         | `en` and `es`.                                                                                      |
| Default/fallback locale | `en`, unless a valid stored preference exists.                                                      |
| Persistence             | Validate and store locale under `innhub.locale`.                                                    |
| Scope                   | Current shell strings and module labels only.                                                       |
| Out of scope            | Settings UI, backend persistence, business-module translation, external UI library, locale routing. |
| Test gates              | `npm run test:run`, `npm run lint`, and `npm run build` in implementation phase.                    |

## Key Risks

- Scope creep into language settings UI.
- Loose translation key typing if design does not set conventions.
- React 19/library compatibility should be confirmed before apply.
- Spanish copy should remain concise and neutral/Rioplatense-friendly.

## Next Recommended

Proceed to SDD spec/design for `add-i18n-foundation`, pinning the exact resource shape, provider location, storage helper behavior, and test cases before implementation.

## Skill Resolution

paths-injected

## Persistence Note

OpenSpec artifacts were written. Engram tools were not available in this subagent tool namespace, so no Engram save was performed.
