# Tasks — define-routing-protected-layout

Issue: #3 `chore(foundation): define routing and protected layout structure`

## Review Workload Forecast

| Field                   | Value                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Estimated changed lines | ~360–420 additions/deletions if kept compact                                           |
| 400-line budget risk    | Medium                                                                                 |
| Chained PRs recommended | No                                                                                     |
| Suggested split         | single PR; if apply forecast rises above ~420 lines, split tests/i18n polish into PR 2 |
| Delivery strategy       | ask-on-risk                                                                            |
| Chain strategy          | pending                                                                                |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Scope Guardrails

- Implement issue #3 only: routes, structural protected shell, compact module placeholders, i18n copy, and routing/layout smoke tests.
- Exclude real auth/session checks, RBAC, backend/InsForge calls, browser persistence, services, feature workflows, Room Status Board, dashboard metrics, charts, forms, operational tables, and direct Stitch HTML/CSS/script porting.
- Keep app-wide routing/layout code under `src/app/`; do not create `src/features/*` module implementations for placeholders.

## Implementation Tasks

### 1. RED — Add failing routing/layout smoke tests

- Files: `src/app/__tests__/App.routing.test.tsx`, existing test setup/discovery under `src/**/*.test.tsx`.
- Create tests using Testing Library and a memory router built from `appRoutes` or a `createAppRouter` factory.
- Cover:
  - `/login` renders the public login placeholder and does not render protected sidebar/topbar landmarks.
  - `/app/dashboard` renders sidebar navigation, topbar/header, and dashboard placeholder in the main workspace.
  - each `protectedRoutes` item renders at its `href` and exposes its translated title/label.
  - sidebar links derive from the same metadata hrefs.
- Verification before implementation: `npm run test:run` should fail for missing route metadata/routes/pages/shell.
- Evidence expected in apply notes: failing test names or concise failure summary.

### 2. GREEN — Define centralized protected route metadata and route tree

- Files: `src/app/routes/routeMetadata.ts`, `src/app/routes/routes.tsx`, `src/app/App.tsx`.
- Add `APP_BASE_PATH`, typed `ProtectedRouteId`, `ProtectedRouteMeta`, and `protectedRoutes` for dashboard, properties, users, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports.
- Define public routes `/` and `/login`, protected parent `/app`, `/app` index redirect to `/app/dashboard`, generated protected child routes from `protectedRoutes`, and `*` fallback.
- Convert `App` to render a React Router provider; prefer exporting a small router factory if needed for test reuse.
- Do not add auth state, auth redirects, role metadata, service names, backend resource names, or persistence checks.
- Verification: targeted tests from task 1 progress from missing-router failures toward rendering failures only.

### 3. GREEN — Move public landing content and add public/fallback placeholders

- Files: `src/app/pages/PublicHomePage.tsx`, `src/app/pages/LoginPlaceholderPage.tsx`, `src/app/pages/NotFoundPage.tsx`, `src/app/App.tsx`.
- Move current localized landing/foundation markup out of `App.tsx` into `PublicHomePage` with minimal links to `/login` and/or `/app/dashboard` as structural preview links.
- Add a compact `LoginPlaceholderPage` with no fields, submit handlers, auth calls, storage, or session behavior.
- Add a compact `NotFoundPage` outside the protected shell, with links back to `/` and/or `/app/dashboard`.
- Verification: `/login` public smoke test passes its no-shell assertions.

### 4. GREEN — Add structural protected layout and shell components

- Files: `src/app/layouts/ProtectedLayout.tsx`, `src/app/shell/AppShell.tsx`, `src/app/shell/SidebarNav.tsx`, `src/app/shell/TopBar.tsx`.
- Implement `ProtectedLayout` as a structural boundary that renders `AppShell` plus `Outlet`; it may use `useLocation()` only to identify active route metadata.
- Implement `AppShell` with accessible sidebar/nav, header/topbar, and `<main id="app-workspace">` workspace regions.
- Implement `SidebarNav` from `protectedRoutes` metadata using `NavLink` and translated labels.
- Implement `TopBar` with translated current route title and static structural workspace/status copy only.
- Keep imports limited to React, React Router, i18n, route metadata, and generic shared UI if already available.
- Verification: `/app/dashboard` smoke test renders shell landmarks and workspace content.

### 5. GREEN — Add generic module placeholders generated from metadata

- Files: `src/app/pages/ModulePlaceholderPage.tsx`, `src/app/routes/routes.tsx`.
- Implement one generic placeholder component receiving `ProtectedRouteMeta`.
- Render translated title, translated description, and a shared placeholder-only note.
- Generate all protected child route elements from `protectedRoutes`.
- Do not add forms, editable records, fake domain data, metrics, charts, tables, actions, Room Status Board, reservation rules, or room-state workflows.
- Verification: metadata iteration test passes for all protected module destinations.

### 6. TRIANGULATE — Extend bilingual i18n resources for routes and shell

- Files: `src/shared/i18n/resources/en.ts`, `src/shared/i18n/resources/es.ts`, `src/shared/i18n/resources/index.ts` if type updates are required.
- Add English and Spanish keys for:
  - public home links if introduced;
  - login placeholder;
  - not-found page;
  - shell sidebar/topbar copy;
  - every `routes.protected.*.{label,title,description}` entry;
  - shared placeholder-only note.
- Keep route metadata as translation keys rather than literal labels.
- Verification: i18n type checks pass through `npm run build`; route tests assert translated headings/labels instead of hard-coded metadata internals where practical.

### 7. REFACTOR — Keep the implementation within review and architecture boundaries

- Files/discovery targets: `src/app/**/*`, `src/shared/i18n/resources/*.ts`, `src/features/**/*` if present.
- Remove duplication between route definitions and sidebar links; `protectedRoutes` remains the source of truth.
- Keep styling compact with existing CSS/Tailwind utilities; do not install dependencies or copy prototype code.
- Confirm no new backend/auth/service imports or browser storage calls were introduced in routing, layout, shell, or placeholders.
- If changed-line forecast exceeds ~420 lines during apply, pause and ask whether to split before continuing.
- Verification commands for apply completion: `npm run lint`, `npm run test:run`, `npm run build`.

## Apply Evidence Checklist

- RED evidence: initial `npm run test:run` failures for new routing/layout tests.
- GREEN evidence: `npm run test:run` passes after implementation.
- Quality evidence: `npm run lint` passes.
- Build evidence: `npm run build` passes.
- Scope evidence: note that backend/auth/workflows/Room Status Board/Stitch HTML port were not implemented.
