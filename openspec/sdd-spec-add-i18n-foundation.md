# SDD Spec — add-i18n-foundation

## Status

success

## Executive Summary

Created the OpenSpec specification artifact for InnHub change `add-i18n-foundation` / issue #26 in English. Because no canonical `openspec/specs/i18n/spec.md` exists yet, the artifact is a new-domain spec at the requested change path rather than a delta against an existing canonical spec.

## Artifacts

| Artifact           |  Status | Path                                                      |
| ------------------ | ------: | --------------------------------------------------------- |
| I18n change spec   | written | `openspec/changes/add-i18n-foundation/specs/i18n/spec.md` |
| Spec phase summary | written | `openspec/sdd-spec-add-i18n-foundation.md`                |

## Acceptance Coverage

- Default English rendering.
- Spanish rendering.
- Invalid persisted locale fallback from `innhub.locale` to English.
- Translation resources outside JSX components.
- No settings UI, backend persistence, locale routing, or external UI component library.
- App shell/module label resource coverage.

## Existing Spec Lookup

- Canonical i18n spec: not found at `openspec/specs/i18n/spec.md`.
- Active same-domain change specs: none found via `openspec/changes/**/specs/i18n/spec.md` before writing this artifact.
- Legacy flat current-change spec: not found at `openspec/changes/add-i18n-foundation/spec.md`.

## Risks

- Artifact store requested `both`, but Engram memory tools are not available in this subagent tool environment, so only OpenSpec/file artifacts were written.
- The explore artifact recommended considering a custom typed i18n layer, but the user direction and proposal explicitly select `i18next` + `react-i18next`; the spec follows the approved direction.

## Next Recommended

Proceed to SDD design for `add-i18n-foundation`, focusing on resource structure, locale validation/storage behavior, provider boundary, and test plan.

## Skill Resolution

paths-injected
