# Archive Report: feat-multi-role-demo-selector

**Archived**: 2026-05-26
**Source**: `openspec/changes/feat-multi-role-demo-selector/`
**Destination**: `openspec/changes/archive/2026-05-26-feat-multi-role-demo-selector/`
**Mode**: openspec

## Summary

Change fully implemented, verified, and archived. Multi-role demo login selector replaces single env-var-driven demo button with a Modal + DemoAccountSelector integration, enabling evaluators to pick any of the 5 InnHub roles at login.

## Specs Synced

### shared-ui

| Action | Details |
|--------|---------|
| MODIFIED | `Requirement: Shared UI Architecture Boundaries` — lifted modal-system prohibition, updated parenthetical note |
| ADDED | `Requirement: Modal Component` — 5 scenarios (overlay render, Esc close, backdrop close, domain-neutral, testable) |

**Changes applied**:
- Parenthetical: `(Previously: Prohibited all external UI libraries including icon packages)` → `(Previously: Prohibited modal system alongside external UI libraries)`
- Scenario "No full design system scope creep": removed `modal system` from prohibited items list
- New requirement inserted with full Modal spec (5 scenarios)

### auth-session

| Action | Details |
|--------|---------|
| MODIFIED | `Requirement: Visible Demo Login Option` — updated to multi-role selector, added parenthetical note, updated scenario names and GIVEN/THEN text |
| ADDED | `Requirement: Demo Account Selector` — 4 scenarios (lists 5 roles, triggers login, integrates via Modal, testable) |

## What Was Implemented

1. **Modal shared component** (`src/shared/components/organisms/Modal.tsx`) — portal-based overlay with backdrop, Esc/click-close, domain-neutral
2. **DemoAccountSelector** (`src/features/auth/components/DemoAccountSelector.tsx`) — lists all 5 roles with i18n labels, calls onSelect(credentials)
3. **LoginForm integration** — "Demo accounts" button opens Modal containing DemoAccountSelector
4. **Fixed demo credentials** — matched to InsForge users
5. **Fixed i18n** — housekeeping → Limpieza in es.ts
6. **Fixed ProtectedLayout redirect** — finds first accessible route instead of hardcoded `/app/dashboard`
7. **Fixed canAccess peer-role bug** — same-level roles require exact match

## Verification

| Check | Result |
|-------|--------|
| Tasks | 12/12 complete |
| Tests | 217 passed (30 files) |
| Lint | Clean |
| Build | Clean |
| Spec compliance | 13/13 scenarios compliant |
| Verdict | PASS — no critical issues |

## Archive Contents

- `proposal.md` ✅
- `specs/shared-ui/spec.md` ✅
- `specs/auth-session/spec.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (12/12 tasks complete)
- `verify-report.md` ✅
- `archive-report.md` ✅

## Source of Truth Updated

- `openspec/specs/shared-ui/spec.md` — requirements up to date with Modal component + updated architecture boundaries
- `openspec/specs/auth-session/spec.md` — requirements up to date with multi-role demo selector + DemoAccountSelector

## Notes

- The `Requirement: Multi-Role Demo Credentials` in `openspec/specs/shared-ui/spec.md` contains a merge note indicating "LoginForm UI integration for role selection is pending a future change." This has now been implemented. The note is preserved for audit trail but is now factually superseded.
- The acceptance criteria in shared-ui still references "modal/table/form system" as prohibited. The single Modal component added by this change is not a full modal system, so this criterion remains accurate.
