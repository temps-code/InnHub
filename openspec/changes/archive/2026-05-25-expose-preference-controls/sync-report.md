# Sync Report — expose-preference-controls

## Status

pass

## Executive Summary

Exposed theme and language toggle controls. Synced the delta specifications for `theme-management`, `preference-ui`, and `i18n` into the main OpenSpec specs directory under `openspec/specs/`.

## Artifacts Read

- `openspec/config.yaml`
- `openspec/changes/expose-preference-controls/proposal.md`
- `openspec/changes/expose-preference-controls/specs/theme-management/spec.md`
- `openspec/changes/expose-preference-controls/specs/preference-ui/spec.md`
- `openspec/changes/expose-preference-controls/specs/i18n/spec.md`
- `openspec/changes/expose-preference-controls/design.md`
- `openspec/changes/expose-preference-controls/tasks.md`
- `openspec/changes/expose-preference-controls/apply-progress.md`
- `openspec/changes/expose-preference-controls/verify-report.md`

## Domains Synced

| Domain | Source | Destination | Result |
| --- | --- | --- | --- |
| `theme-management` | `openspec/changes/expose-preference-controls/specs/theme-management/spec.md` | `openspec/specs/theme-management/spec.md` | Created new canonical spec |
| `preference-ui` | `openspec/changes/expose-preference-controls/specs/preference-ui/spec.md` | `openspec/specs/preference-ui/spec.md` | Created new canonical spec |
| `i18n` | `openspec/changes/expose-preference-controls/specs/i18n/spec.md` | `openspec/specs/i18n/spec.md` | Merged delta into existing canonical spec |

## Requirements Synced

### ADDED

- **Theme Persistence and DOM Application** (domain: `theme-management`)
- **Default Theme Resolution** (domain: `theme-management`)
- **Accessible Theme Toggle Controls** (domain: `preference-ui`)
- **Accessible Locale Toggle Controls** (domain: `preference-ui`)
- **PreferenceBar Composition and Layout Placement** (domain: `preference-ui`)
- **Minimal Preference Controls UI** (domain: `i18n` - replaces "No User Settings UI")

### MODIFIED

- **No User Settings UI** (domain: `i18n` - replaced by "Minimal Preference Controls UI")

### REMOVED

- None

## Active Same-Domain Change Warnings

None found. No other active change specs touched these domains at sync time.

## Destructive Merge Guard

No destructive merge was performed. The modification replaces a strict negation requirement ("No User Settings UI") with a functional UI control requirement ("Minimal Preference Controls UI") as requested and approved.

## Notes

The synchronization process was completed safely:
- New domains (`theme-management`, `preference-ui`) had their specifications copied over to the main directory.
- The `i18n` domain had its delta specifications merged into `openspec/specs/i18n/spec.md` while preserving all other pre-existing requirements (Foundation, Supported Locale Policy, Persisted Locale Validation, Resource Coverage).
