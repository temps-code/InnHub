# Design — define-routing-protected-layout

Define a narrow React routing and protected layout foundation for InnHub. This design covers route grouping, route/navigation metadata, a structural protected layout boundary, the shared app shell, compact module placeholders, i18n copy, tests, and review workload controls only.

## Decision Summary

| Area               | Decision                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Router             | Use the existing `react-router-dom` dependency; define route objects once and render them with a browser router from the app layer.                    |
| Route groups       | Public routes live outside the shell; protected application routes live under `/app/*` and always render through a structural protected layout.        |
| Protected behavior | The protected boundary is structural only. It does not check auth state, redirect based on sessions, read storage, call a provider, or implement RBAC. |
| Route metadata     | Centralize protected module IDs, paths, hrefs, and translation keys in one typed metadata file used by both route creation and sidebar navigation.     |
| Shell              | Add `ProtectedLayout` plus `AppShell`, `SidebarNav`, and `TopBar` under the app layer. The shell owns layout composition only.                         |
| Placeholders       | Add compact placeholders for dashboard, properties, users, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports.   |
| i18n               | Keep `AppProviders` and existing i18n resources. Add route, shell, public page, and placeholder copy in English and Spanish resources.                 |
| Tests              | Add focused routing/layout smoke tests, not workflow tests. Verify public routes omit the shell and protected routes render shell + placeholders.      |
| No-goals           | No real auth, backend/InsForge, service contracts, workflows, Room Status Board, dashboard metrics, or Stitch HTML/CSS/script port.                    |

## Current State

- `src/main.tsx` mounts `<App />` inside `AppProviders` and `StrictMode`.
- `src/app/App.tsx` currently renders a static localized landing/foundation shell with `ModuleCard` and `PageSection`.
- `AppProviders` only wraps `I18nextProvider`, which should remain the provider foundation.
- `react-router-dom` is already installed.
- Shared primitives exist under `src/shared/components`, but no app-wide layout/shell components exist yet.
- Styling already uses Tailwind CSS utilities and design tokens in `src/index.css`; this change should not install styling libraries or port prototype CSS.

## Target File Structure

```text
src/
├── app/
│   ├── App.tsx                         # router provider entry
│   ├── layouts/
│   │   └── ProtectedLayout.tsx          # structural protected boundary + outlet
│   ├── pages/
│   │   ├── LoginPlaceholderPage.tsx
│   │   ├── ModulePlaceholderPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── PublicHomePage.tsx
│   ├── routes/
│   │   ├── routeMetadata.ts             # public/protected path and nav metadata
│   │   └── routes.tsx                   # route object tree
│   ├── shell/
│   │   ├── AppShell.tsx
│   │   ├── SidebarNav.tsx
│   │   └── TopBar.tsx
│   └── __tests__/
│       └── App.routing.test.tsx
└── shared/
    └── i18n/resources/
        ├── en.ts
        └── es.ts
```

Keep routing, layouts, shell, and placeholder pages in `src/app/` because they are app-wide structure. Do not place these placeholders inside `src/features/*`; feature folders should be introduced when actual module behavior begins.

## Route Design

### Paths

Use stable, readable paths:

| Group     | Path                | Purpose                                                                       |
| --------- | ------------------- | ----------------------------------------------------------------------------- |
| Public    | `/`                 | Public landing/entry page, adapted from the current static InnHub shell.      |
| Public    | `/login`            | Login placeholder only; no login behavior.                                    |
| Protected | `/app`              | Structural protected group parent; index route navigates to `/app/dashboard`. |
| Protected | `/app/dashboard`    | Dashboard placeholder.                                                        |
| Protected | `/app/properties`   | Properties placeholder.                                                       |
| Protected | `/app/users`        | Users placeholder.                                                            |
| Protected | `/app/rooms`        | Rooms placeholder; no Room Status Board.                                      |
| Protected | `/app/room-types`   | Room types placeholder.                                                       |
| Protected | `/app/guests`       | Guests placeholder.                                                           |
| Protected | `/app/reservations` | Reservations placeholder; no availability rules.                              |
| Protected | `/app/housekeeping` | Housekeeping placeholder.                                                     |
| Protected | `/app/maintenance`  | Maintenance placeholder.                                                      |
| Protected | `/app/billing`      | Billing placeholder; no payments/invoices behavior.                           |
| Protected | `/app/reports`      | Reports placeholder; no metrics/charts.                                       |
| Fallback  | `*`                 | Not found page.                                                               |

The `/app` index may use `<Navigate to="/app/dashboard" replace />` because this is a structural default inside the protected route group, not auth enforcement.

### Route Metadata Shape

Create `src/app/routes/routeMetadata.ts` as the single source for protected module navigation and placeholder copy keys:

```ts
export const APP_BASE_PATH = "/app";

export type ProtectedRouteId =
  | "dashboard"
  | "properties"
  | "users"
  | "rooms"
  | "roomTypes"
  | "guests"
  | "reservations"
  | "housekeeping"
  | "maintenance"
  | "billing"
  | "reports";

export type ProtectedRouteMeta = {
  id: ProtectedRouteId;
  path: string;
  href: `${typeof APP_BASE_PATH}/${string}`;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
};

export const protectedRoutes = [
  {
    id: "dashboard",
    path: "dashboard",
    href: "/app/dashboard",
    labelKey: "routes.protected.dashboard.label",
    titleKey: "routes.protected.dashboard.title",
    descriptionKey: "routes.protected.dashboard.description",
  },
  // remaining modules...
] as const satisfies readonly ProtectedRouteMeta[];
```

Design rules:

- `path` is the nested route segment.
- `href` is the full link target used by sidebar navigation.
- `labelKey`, `titleKey`, and `descriptionKey` are translation keys, not rendered copy.
- Sidebar links and generated route elements must both use `protectedRoutes` to prevent path/label drift.
- Avoid storing auth requirements, roles, backend resources, permissions, or feature service names in this metadata.

### Route Object Tree

Create `src/app/routes/routes.tsx` with route objects similar to:

```tsx
export const appRoutes: RouteObject[] = [
  { path: "/", element: <PublicHomePage /> },
  { path: "/login", element: <LoginPlaceholderPage /> },
  {
    path: APP_BASE_PATH,
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      ...protectedRoutes.map((route) => ({
        path: route.path,
        element: <ModulePlaceholderPage route={route} />,
      })),
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];
```

`src/app/App.tsx` should become the router provider entry. Prefer route objects so tests can reuse `appRoutes` with a memory router:

```tsx
const router = createBrowserRouter(appRoutes);

export function App() {
  return <RouterProvider router={router} />;
}
```

If test setup needs isolation, export a small `createAppRouter` factory instead of exporting a singleton browser router. Do not move `I18nextProvider` into router files; keep it in `AppProviders`.

## Layout and Shell Design

### ProtectedLayout

`src/app/layouts/ProtectedLayout.tsx` is the structural boundary for protected application space:

- renders `<AppShell>`;
- passes protected navigation metadata to the shell;
- renders `<Outlet />` in the shell workspace;
- may determine the active route by `useLocation()` and the centralized metadata;
- must not read auth/session state, browser storage, backend services, or feature hooks;
- must not redirect except for the `/app` index route defined in route configuration.

### AppShell

`src/app/shell/AppShell.tsx` composes the main protected layout:

- fixed or sticky sidebar region on desktop;
- topbar/header region;
- main workspace region containing `children`;
- accessible landmarks: sidebar as `<aside>` or `<nav>`, topbar as `<header>`, content as `<main id="app-workspace">`;
- styling should use existing Tailwind utilities and CSS variables (`--color-background`, `--color-surface`, `--color-border`, etc.).

The shell should be visually inspired by the prototype evaluation: calm SaaS layout, left navigation, topbar, light workspace, violet accent. It must not copy Stitch HTML, CDN Tailwind config, inline scripts, Chart.js usage, or prototype-only implementation details.

### SidebarNav

`src/app/shell/SidebarNav.tsx` renders `NavLink`s from `protectedRoutes`:

- accepts `items: readonly ProtectedRouteMeta[]`;
- translates labels with `useTranslation()`;
- uses `NavLink` active state for current route styling;
- exposes an accessible label such as `t("shell.sidebar.ariaLabel")`;
- includes InnHub brand text or icon only as shell decoration;
- does not group by roles or permissions.

### TopBar

`src/app/shell/TopBar.tsx` renders page context only:

- translated current route title when a protected module route matches;
- a short structural status/copy such as “Prototype foundation” or “Protected layout placeholder”;
- optional property context placeholder text, e.g. “Property workspace”, but no property selector behavior;
- no user menu, logout action, notifications, role badge, or auth-dependent UI unless rendered explicitly as disabled/static placeholder copy.

## Page Design

### PublicHomePage

Move the current landing content from `src/app/App.tsx` into `src/app/pages/PublicHomePage.tsx`, preserving the existing localized hero/foundation direction. It may add a link to `/login` or `/app/dashboard`, but should not imply real login/session behavior.

### LoginPlaceholderPage

A compact public page explaining that login/session enforcement is planned for the future auth slice:

- no form fields;
- no submit handlers;
- no localStorage/sessionStorage;
- optional link to `/app/dashboard` labelled as a structural preview or app preview.

### ModulePlaceholderPage

A generic protected placeholder component receives `ProtectedRouteMeta` and renders:

- translated title;
- translated description;
- a small “placeholder only” note from shared route/page copy;
- no forms, editable controls, tables, operational actions, calculated metrics, fake records, charts, Room Status Board, or domain workflow widgets.

This keeps 11 module destinations compact while avoiding 11 separate page components.

### NotFoundPage

Simple page with translated not-found title and links back to `/` or `/app/dashboard`. If rendered outside `/app`, it should not show the protected shell.

## I18n Strategy

Continue using the existing `shared/i18n/resources/en.ts` and `es.ts` resources. Add keys under clear namespaces, for example:

```ts
public: {
  home: { ... },
  login: { title, description, previewLink },
  notFound: { title, description, homeLink },
},
shell: {
  sidebar: { ariaLabel },
  topbar: { eyebrow, workspaceLabel },
},
routes: {
  protected: {
    dashboard: { label, title, description },
    properties: { label, title, description },
    // ...
  },
},
placeholders: {
  note: "Placeholder only. Feature workflows will be implemented in later slices.",
},
```

Spanish copy must be updated alongside English because the project maintains bilingual user-facing documentation/resources. Translation keys should remain stable and referenced from metadata; do not duplicate literal labels in route config and components.

## Test Strategy

Add focused tests in `src/app/__tests__/App.routing.test.tsx` using Testing Library and a memory router created from `appRoutes`.

Required smoke coverage:

1. `/login` renders the public login placeholder and does not render sidebar/topbar landmarks.
2. `/app/dashboard` renders sidebar navigation, topbar, and dashboard placeholder inside the workspace.
3. Each `protectedRoutes` item has a reachable route: iterate metadata, render its `href`, and assert its translated label/title or stable heading renders.
4. Sidebar links use the same `href` values from `protectedRoutes`.

Keep tests structural. Do not test auth decisions, feature workflows, reservation rules, data fetching, or visual fidelity. If the test file causes review workload to exceed the 400 changed-line budget during apply, reduce to one public-route smoke test, one protected-route smoke test, and one metadata consistency assertion before asking for a split.

## Data Flow and Boundaries

```text
main.tsx
  └─ AppProviders (i18n only)
      └─ App (RouterProvider)
          ├─ public route element
          └─ /app ProtectedLayout
              └─ AppShell
                  ├─ SidebarNav ← protectedRoutes metadata + i18n labels
                  ├─ TopBar ← active protected route metadata + i18n title
                  └─ workspace Outlet
                      └─ ModulePlaceholderPage ← protected route metadata + i18n copy
```

Boundary rules:

- App layer may import shared generic UI primitives if useful.
- App shell must not import feature services or feature hooks.
- Placeholder pages must not introduce backend contracts or domain rules.
- Realtime, InsForge, auth provider, property scoping, and data validation remain future work.

## Rollout Plan for Later Apply Phase

1. Add `routeMetadata.ts` and `routes.tsx` under `src/app/routes/`.
2. Convert `src/app/App.tsx` to render the router provider.
3. Move current landing markup into `PublicHomePage` and add public placeholders/fallback page.
4. Add `ProtectedLayout`, `AppShell`, `SidebarNav`, and `TopBar`.
5. Add generic `ModulePlaceholderPage` and generate protected child routes from metadata.
6. Extend English and Spanish i18n resources.
7. Add compact routing/layout smoke tests.
8. Run `npm run lint`, `npm run test:run`, and `npm run build` during apply if code changes are made.

## Tradeoffs

| Decision                                    | Benefit                                                                          | Tradeoff / Mitigation                                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/app/*` protected group                    | Clear boundary for future auth and app shell.                                    | Adds `/app` prefix to all module URLs; acceptable because it separates public and internal spaces. |
| Structural protected layout now             | Future auth issue can replace/enhance one boundary.                              | Users can access protected placeholders today; document and name it structural-only.               |
| Generic module placeholder component        | Keeps implementation small and within review budget.                             | Less module-specific visual distinction; acceptable because workflows are out of scope.            |
| Central route metadata                      | Prevents route/sidebar drift and supports academic “extract constants” evidence. | Metadata has translation-key strings; keep shape small and typed.                                  |
| Route objects + RouterProvider              | Tests can reuse the same route tree with a memory router.                        | Slightly more setup than `<BrowserRouter><Routes />`; worthwhile for consistency tests.            |
| App-layer shell instead of shared component | Avoids making app-specific navigation a generic shared primitive.                | If future products need a generic layout primitive, extract later after reuse is visible.          |

## Review Workload Forecast

The later implementation should remain near the 400 changed-line budget if kept compact:

- route metadata and route tree: ~70–90 lines;
- shell/layout components: ~130–170 lines;
- public and placeholder pages: ~80–110 lines;
- i18n additions: ~60–90 lines;
- smoke tests: ~60–90 lines.

To stay reviewable:

- use one generic module placeholder instead of 11 page files;
- avoid icons, complex responsive menus, fake data, forms, tables, and charts;
- avoid broad visual polish or component-library expansion;
- keep tests structural and metadata-driven.

If the tasks/apply forecast rises materially above 400 changed lines, pause before implementation and ask whether to split shell/routing from tests or placeholders.

## Risks and Mitigations

| Risk                                       | Mitigation                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Protected layout is mistaken for real auth | Name it `ProtectedLayout` only as structural route grouping and document no enforcement in code comments/design. |
| Scope expands into module features         | Use `ModulePlaceholderPage` only; reject forms, tables, actions, fake records, metrics, and Room Status Board.   |
| Prototype is copied directly               | Rebuild React components with existing Tailwind/CSS tokens; use prototype evaluation only for composition.       |
| Navigation and route paths drift           | Generate protected routes and sidebar links from `protectedRoutes`.                                              |
| Backend assumptions leak into app shell    | Keep shell imports limited to React, React Router, i18n, route metadata, and shared UI primitives.               |
| Review budget is exceeded                  | Keep placeholders generic; reduce tests to smoke coverage or split before apply.                                 |

## Acceptance Mapping

| Spec requirement                    | Design support                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public Route Group                  | `/` and `/login` route outside `ProtectedLayout`; no shell or backend/auth behavior.                                                              |
| Structural Protected Route Group    | `/app/*` uses `ProtectedLayout`; no session checks, redirects based on auth, or RBAC.                                                             |
| Shared Application Shell            | `AppShell` composes `SidebarNav`, `TopBar`, and workspace `Outlet`.                                                                               |
| MVP Module Placeholder Destinations | `protectedRoutes` defines dashboard, properties, users, rooms, room types, guests, reservations, housekeeping, maintenance, billing, and reports. |
| Route and Navigation Consistency    | Sidebar and generated child routes both consume `protectedRoutes`.                                                                                |
| Architecture Boundary Compliance    | Routing/layout/shell/pages stay in `src/app`; no backend, services, workflows, or feature-specific behavior.                                      |
