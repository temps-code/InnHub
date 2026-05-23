# Proposal — define-routing-protected-layout

## Change ID

`define-routing-protected-layout`

## Related Issue

- Issue #3: `chore(foundation): define routing and protected layout structure`

## Intent

Define the frontend routing and protected application layout foundation for InnHub before feature modules grow independently. This change establishes a stable React route tree, separates public and protected route groups structurally, and introduces the authenticated app shell pattern that future MVP screens can reuse.

The protected boundary in this change is structural only. It prepares the place where real authentication and session enforcement will be added later by issue #5, but it must not implement auth logic, backend calls, role checks, or persistent session handling.

## Problem

The current React app is still close to a starter/static shell and does not yet provide the navigable application structure required by InnHub's MVP modules. Without a routing and layout foundation, future work may duplicate navigation, mix layout concerns into feature screens, or build module UI against an unstable app structure.

## Proposed Change

Implement a narrow foundation for route organization and protected layout composition:

- define a React Router route structure using the existing `react-router-dom` dependency;
- separate public routes from protected application routes;
- create a structural protected route/layout boundary with no real auth/session enforcement;
- introduce an app shell inspired by the Stitch prototype evaluation, including:
  - sidebar navigation;
  - topbar/header area;
  - main workspace for nested route content;
- add compact placeholder pages for MVP modules so navigation has stable destinations;
- centralize route/navigation metadata where practical to avoid duplicated labels and paths;
- preserve existing provider/i18n setup;
- keep all components free from backend, InsForge, or feature workflow logic.

## Scope

In scope:

- routing foundation under the app layer;
- public route group placeholders, such as landing/login placeholders if needed for route structure;
- protected route group and nested layout structure;
- structural `ProtectedLayout`/app shell components;
- sidebar and topbar composition;
- placeholder pages for MVP modules such as dashboard, properties, users, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports;
- route/navigation labels needed by the shell;
- focused tests or smoke coverage for route/layout rendering if included in the later implementation plan.

## Acceptance Boundary

The change is acceptable when:

- the app has an explicit route tree with public and protected sections;
- protected routes render through a shared app shell with sidebar, topbar, and content outlet;
- MVP module destinations exist as placeholders only;
- navigation links are consistent with route definitions;
- the implementation follows `docs/05-architecture.md` layer rules;
- no component performs backend/InsForge access;
- no real authentication, authorization, or session validation is introduced;
- the implementation remains reviewable within the 400 changed-line budget or is split before apply.

## Non-goals

Explicitly out of scope:

- real auth/session enforcement;
- login/logout behavior beyond structural placeholders;
- RBAC or role-based authorization;
- backend/InsForge integration;
- database schema or service contracts;
- feature workflows for reservations, rooms, guests, billing, housekeeping, maintenance, reports, or dashboard metrics;
- Room Status Board implementation;
- reservation availability or room-state business rules;
- direct port/copy of Stitch-generated HTML, CDN Tailwind configuration, inline scripts, or prototype-only code;
- installing Tailwind or major UI libraries;
- broad visual redesign or reusable component library expansion beyond what the shell needs.

## Affected Areas

Likely implementation areas for later phases:

- `src/main.tsx` or app bootstrap if router provider placement changes;
- `src/app/App.tsx`;
- `src/app/routes/*` for route definitions and route metadata;
- `src/app/layouts/*` or `src/app/shell/*` for protected layout and shell components;
- `src/app/providers/AppProviders.tsx` if provider composition needs adjustment;
- `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts` for route/navigation copy;
- optional focused app-level tests.

Exact files and names should be finalized in the design phase.

## Dependencies

- `react-router-dom` is already available and should be used rather than introducing a new router.
- Existing `AppProviders` and i18n resources should remain the provider foundation.
- Existing shared UI primitives may be reused if they fit without domain leakage.
- `docs/05-architecture.md` and `AGENTS.md` define layer boundaries.
- `docs/prototype/evaluation.md` is a visual reference only, not source code.

## Issue Interactions

- Issue #3 is the primary scope for this routing and protected layout foundation.
- Issue #5 should later replace the structural protected boundary with real auth/session behavior.
- Issues #4-#9 cover backend foundation and related data work; this change must not invent backend contracts for them.
- The future Room Status Board slice can build inside this shell later, but it is excluded from this change.

## Rollout and Review Considerations

This should be a small foundation change on the `features` branch after approval of later SDD phases. Keep the implementation compact and avoid detailed module UI so the work stays inside the 400 changed-line review budget.

Recommended rollout style:

1. add route metadata and route tree;
2. add structural protected layout/app shell;
3. add compact placeholders;
4. add or adjust minimal i18n copy;
5. run the normal validation commands relevant to TypeScript/React changes during apply.

If design or task planning forecasts more than 400 changed lines, pause before implementation and split the work or ask for a delivery decision.

## Risks and Mitigations

| Risk                                                  | Mitigation                                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Structural protected layout is mistaken for real auth | Name and document it as structural-only; leave real enforcement to issue #5.                              |
| Scope expands into feature workflows                  | Use placeholders only and avoid forms, tables with business behavior, mock backend data, or domain rules. |
| Prototype becomes a direct HTML/CSS port              | Use prototype evaluation as visual guidance only; rebuild in React architecture.                          |
| Route labels and paths become duplicated              | Centralize route/navigation metadata in design and implementation.                                        |
| Review budget is exceeded                             | Keep shell and placeholders compact; split before apply if forecast grows.                                |
| Backend assumptions leak into UI                      | Do not call InsForge or create service contracts in this change.                                          |

## Rollback

Rollback should be straightforward because this change is frontend-structural only. Revert the route tree, protected layout/shell files, placeholder pages, and related i18n/test additions. No database, backend, auth provider, or persistent data migration should be involved.

## Success Criteria

- InnHub has a clear public/protected route foundation.
- Protected application pages share a consistent shell with sidebar, topbar, and workspace.
- MVP module placeholders provide stable destinations for future slices.
- The design remains compatible with future auth (#5), backend work (#4-#9), and Room Status Board work.
- The change follows architecture rules and avoids backend/auth/feature workflow implementation.
- The implementation plan remains narrow enough for review or is split before apply.
