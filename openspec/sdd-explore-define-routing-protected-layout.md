# SDD Explore — define-routing-protected-layout

## Status

Completed.

## Issue

- GitHub issue: #3 `chore(foundation): define routing and protected layout structure`
- Branch target: `features`
- Execution mode: interactive
- Artifact store: OpenSpec repository files
- PR strategy: auto-forecast
- Review budget: 400 changed lines

## Executive Summary

Issue #3 is the right anchor for the next implementation step. The project now has shared UI primitives and a Stitch prototype reference, but the React app still lacks a real route tree, public/protected route grouping, authenticated layout boundary, sidebar/topbar shell, and module placeholder screens.

This change should stay narrow: routing, structural protected layout, app shell, navigation, and placeholders only. It must not implement backend access, real authentication, feature workflows, or a direct port of the Stitch HTML export.

## Problem

The current frontend is still close to a static localized shell. It does not yet provide the navigable application structure required by the MVP modules.

Without a routing/layout foundation, future feature work risks duplicating navigation, mixing layout with feature screens, or building UI against an unstable app structure.

## Scope

In scope:

- Introduce a React Router route foundation using the existing dependency.
- Define public and protected route groups structurally.
- Create an authenticated app layout boundary without real session enforcement.
- Create an app shell inspired by `docs/prototype/evaluation.md`:
  - sidebar navigation;
  - topbar;
  - main content workspace.
- Add placeholder screens for MVP modules.
- Keep components free from backend/data-access logic.
- Preserve existing i18n/provider structure.

## Non-goals

Out of scope:

- Real authentication/session validation.
- RBAC or role-based authorization.
- InsForge/backend integration.
- Backend service layer.
- Feature workflows.
- Room Status Board implementation.
- Reservation/availability business rules.
- Direct copy/port of Stitch-generated HTML/CSS/scripts.
- Full reusable component library expansion.

## Dependencies and Inputs

- `react-router-dom` is already installed.
- `AppProviders` already wraps i18n.
- Shared UI primitives exist under `src/shared/components`.
- Prototype guidance exists in `docs/prototype/evaluation.md`.
- Architecture rules are documented in `docs/05-architecture.md`.
- Issue #5 will later implement real auth/session behavior.
- Issues #4–#9 cover backend foundation and should remain separate.

## Likely Files

Likely implementation areas:

- `src/main.tsx`
- `src/app/App.tsx`
- `src/app/routes/*`
- `src/app/layouts/*` or `src/app/shell/*`
- `src/app/providers/AppProviders.tsx`
- `src/app/__tests__/*`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`

Exact file names should be decided in the design phase.

## Issue Interactions

| Issue                  | Interaction                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| #3                     | Primary scope: routing and protected layout structure                             |
| #5                     | Later replaces structural protected boundary with real auth/session behavior      |
| #4–#9                  | Backend foundation remains separate; no service contracts should be invented here |
| #12 or future UI slice | Room Status Board can use the shell later, but should not be implemented in #3    |
| #21                    | Dashboard metrics remain future work; placeholders only in #3                     |

## Risks

| Risk                                                 | Mitigation                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Temporary protected layout is mistaken for real auth | Name it structural-only in proposal/spec and UI copy if needed  |
| App shell expands into visual redesign               | Keep styling minimal and reference-driven; no Stitch HTML port  |
| Placeholder screens become fake features             | Use placeholders only; avoid business forms/tables/workflows    |
| Navigation labels/routes duplicate across files      | Centralize route metadata in design                             |
| Review workload exceeds 400 lines                    | Keep placeholders compact; split if design/tasks forecast grows |

## Review Workload Forecast

Likely manageable within the 400 changed-line review budget if limited to:

- route config;
- app shell components;
- compact module placeholders;
- route/navigation metadata;
- focused tests;
- i18n additions.

The change may exceed budget if it attempts detailed visual polish, multiple full screens, feature-specific mock data, or Room Status Board implementation.

## Next Recommended Phase

Proceed to SDD proposal for `define-routing-protected-layout`.

The proposal should explicitly define:

- the structural-only protected layout behavior;
- no backend/auth implementation;
- no direct Stitch export port;
- relationship with future auth/backend/features;
- acceptance boundaries for issue #3.
