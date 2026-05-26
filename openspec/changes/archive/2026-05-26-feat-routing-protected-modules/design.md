# Design: Protected Route Groups with Role-Based Navigation

## Technical Approach

Restructure flat route list into 3 groups (`operations | reports | settings`) with role-based sidebar visibility. Settings routes nest under `/app/settings/*` via a new `SettingsLayout`. Filtering is purely UI-level — no route guards, no backend RBAC changes.

---

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Separate arrays vs single array with group filter | One array simplifies route enumeration but complicates settings nesting in `routes.tsx` | **Two arrays**: `protectedRoutes` (top-level) + `settingsRoutes` (nested). Export both. |
| Role filtering in SidebarNav vs ProtectedLayout | SidebarNav keeps it simple; ProtectedLayout keeps role access centralized for future use | **ProtectedLayout** derives role and filters, passes pre-filtered grouped items down |
| New i18n keys vs reuse `routes.protected.*` | New keys = more strings; reusing avoids duplication but `properties` → `propertyProfile` changes ID | **Reuse existing keys** — settings routes keep `routes.protected.properties.*` and `routes.protected.users.*` |

---

## Data Flow

```
useAuthSession()  ──→  ProtectedLayout
                           │
                    derive role, filter & group routes
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              AppShell       <Outlet />
                    │
                    ▼
              SidebarNav (grouped sections)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/routes/SettingsLayout.tsx` | Create | Layout with sub-nav for settings child routes |
| `src/app/routes/routeMetadata.ts` | Modify | Add `RouteGroup`, `group` + `minRole` to meta, split settings, add `canAccess()`, rename `properties` → `propertyProfile` |
| `src/app/routes/routes.tsx` | Modify | Nest settings routes under `/settings/`, add `/properties` → `/settings/property` redirect |
| `src/app/layouts/ProtectedLayout.tsx` | Modify | Derive role from session, filter routes by role, group items, pass to AppShell |
| `src/app/shell/AppShell.tsx` | Modify | Accept `GroupedRouteItem[]` instead of flat array |
| `src/app/shell/SidebarNav.tsx` | Modify | Render grouped sections with headers, `aria-label` per group |
| `src/shared/i18n/resources/en.ts` | Modify | Add `shell.sidebar.group.*` keys |
| `src/shared/i18n/resources/es.ts` | Modify | Add Spanish `shell.sidebar.group.*` keys |
| `src/app/__tests__/App.routing.test.tsx` | Modify | Add role-filtering test, settings-route test, redirect test |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Modify | Adapt to grouped prop shape, add header rendering test |
| `docs/05-architecture.md` | Modify | Add route groups section |
| `docs/05-architecture.es.md` | Modify | Mirror English changes |

---

## Interfaces / Contracts

```typescript
// ——— routeMetadata.ts ———

type RouteGroup = "operations" | "reports" | "settings";

type ProtectedRouteMeta = {
  id: ProtectedRouteId;
  path: string;
  href: `/${string}`;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
  icon?: ComponentType<LucideProps>;
  group: RouteGroup;                        // NEW
  minRole: AppProfileRole;                  // NEW
};

// Role hierarchy — plain map, pure function
const ROLE_ORDER: Record<AppProfileRole, number> = {
  administrator: 100,
  manager: 80,
  receptionist: 60,
  housekeeping: 40,
  maintenance: 40,
};

function canAccess(minRole: AppProfileRole, userRole: AppProfileRole): boolean {
  return ROLE_ORDER[userRole] >= ROLE_ORDER[minRole];
}

// Two exportable arrays
const protectedRoutes: readonly ProtectedRouteMeta[] = [/* dashboard, rooms, roomTypes, guests, reservations, housekeeping, maintenance, billing, reports */];
const settingsRoutes: readonly ProtectedRouteMeta[] = [/* propertyProfile (path: "property"), users */];

// Updated type — "properties" → "propertyProfile"
type ProtectedRouteId =
  | "dashboard" | "rooms" | "roomTypes" | "guests" | "reservations"
  | "housekeeping" | "maintenance" | "billing" | "reports"
  | "propertyProfile" | "users";

// ——— new type for grouped sidebar ———

type GroupedRouteItem = {
  group: RouteGroup;
  labelKey: `shell.sidebar.group.${RouteGroup}`;
  items: readonly ProtectedRouteMeta[];
};
```

---

## Key Implementation Details

### `routes.tsx`

```tsx
{
  path: APP_BASE_PATH,
  element: <ProtectedLayout />,
  children: [
    { index: true, element: <Navigate to="/app/dashboard" replace /> },
    // Top-level routes (operations + reports)
    ...protectedRoutes.map((route) => ({
      path: route.path,
      element: <ModulePlaceholderPage route={route} />,
    })),
    // Settings nesting
    {
      path: "settings",
      element: <SettingsLayout />,
      children: settingsRoutes.map((route) => ({
        path: route.path,  // "property" | "users"
        element: route.id === "propertyProfile"
          ? <PropertyProfilePage titleKey={route.titleKey} />
          : <ModulePlaceholderPage route={route} />,
      })),
    },
    // Old path redirect
    { path: "properties", element: <Navigate to="/app/settings/property" replace /> },
  ],
}
```

### `ProtectedLayout.tsx`

When `state.status === "authenticated"`, derive `userRole = state.session.profile.role`, then:

```typescript
const allRoutes = [...protectedRoutes, ...settingsRoutes];
const visibleRoutes = allRoutes.filter((r) => canAccess(r.minRole, userRole));

// Group by `group` field
const grouped: GroupedRouteItem[] = [
  { group: "operations", labelKey: "shell.sidebar.group.operations", items: visibleRoutes.filter(r => r.group === "operations") },
  { group: "reports", labelKey: "shell.sidebar.group.reports", items: visibleRoutes.filter(r => r.group === "reports") },
  { group: "settings", labelKey: "shell.sidebar.group.settings", items: visibleRoutes.filter(r => r.group === "settings") },
].filter(g => g.items.length > 0);
```

Pass `grouped` to `<AppShell>` instead of `protectedRoutes`.

### `SettingsLayout.tsx`

Minimal layout with a sub-header and `<Outlet />`:

```tsx
export function SettingsLayout() {
  return (
    <>
      <nav aria-label="Settings navigation">
        {/* Links to /app/settings/property and /app/settings/users */}
      </nav>
      <Outlet />
    </>
  );
}
```

### `SidebarNav.tsx`

Accepts `GroupedRouteItem[]`. Renders a `<section>` per group with a heading.

### i18n additions

```typescript
// en.ts + es.ts
shell: {
  sidebar: {
    ariaLabel: "Application modules" | "Módulos de la aplicación",
    group: {
      operations: "Operations" | "Operaciones",
      reports: "Reports" | "Reportes",
      settings: "Settings" | "Configuración",
    },
  },
}
```

---

## Route Assignment

| Route ID | Group | minRole | Path |
|----------|-------|---------|------|
| dashboard | operations | receptionist | /app/dashboard |
| rooms | operations | receptionist | /app/rooms |
| roomTypes | operations | receptionist | /app/room-types |
| guests | operations | receptionist | /app/guests |
| reservations | operations | receptionist | /app/reservations |
| housekeeping | operations | housekeeping | /app/housekeeping |
| maintenance | operations | maintenance | /app/maintenance |
| billing | operations | receptionist | /app/billing |
| reports | reports | manager | /app/reports |
| propertyProfile | settings | administrator | /app/settings/property |
| users | settings | administrator | /app/settings/users |

---

## Testing Strategy

| Existing Test | Change |
|---------------|--------|
| "keeps protected route metadata reachable" | Iterate `[...protectedRoutes, ...settingsRoutes]` instead of `protectedRoutes` |
| SidebarNav icon tests | Update prop type to `GroupedRouteItem[]` |

| New Test | Layer | What it covers |
|----------|-------|----------------|
| Settings routes render under /app/settings/* | Integration | Navigate to `/app/settings/property`, assert `PropertyProfilePage` renders |
| /app/properties redirects to /app/settings/property | Integration | Assert `Navigate` fires |
| Administrator sees all 3 groups | Integration | Assert group headers rendered |
| Receptionist sees only operations items | Integration | Assert settings/reports items absent |
| `canAccess` pure function | Unit | Test hierarchy matrix (admin≥manager≥receptionist≥housekeeping=maintenance) |

---

## Migration / Rollout

No data migration. Old `/app/properties` redirect covers existing bookmarks. Rollback: revert all modified files, delete `SettingsLayout.tsx`.

---

## Open Questions

None. All decisions are resolved in proposal and spec.
