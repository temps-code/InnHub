# Design: UI Icon System for Navigation

## Technical Approach

Install `lucide-react`, extend `ProtectedRouteMeta` with an optional `icon` field typed as `React.ComponentType<LucideProps>`, render the icon component before the label in `SidebarNav` with `aria-hidden="true"`. All icon imports are colocated in `routeMetadata.ts` — no wrapper, no external map.

## Architecture Decisions

### Decision: lucide-react over Heroicons / Phosphor / React Icons

| Option | Tree-shake | Bundle (gzip) | React 19 | Set size | Decision |
|--------|-----------|---------------|----------|----------|----------|
| lucide-react | Yes | ~16KB all icons | ✅ | 1.5k+ | **Selected** |
| Heroicons | Yes | ~12KB | ✅ | ~500 | Smaller set, Tailwind-coupled sizing |
| Phosphor | Yes | ~24KB | ✅ | 6k+ | Larger bundle, more weights than needed |
| react-icons | Poor | ~50KB+ | ⚠️ | All | Worst size, mixed quality |

**Rationale**: lucide-react is documented in the spec, tree-shakeable, React 19 compatible, has a matching icon for every route, and aligns with the existing MIT-licensed dependency profile.

### Decision: Icon type as `React.ComponentType<LucideProps>` (optional)

**Choice**: `icon?: React.ComponentType<LucideProps>` in `ProtectedRouteMeta`
**Alternatives**: `LucideIcon` type (Lucide export); `ComponentType<SVGProps>` (too generic)
**Rationale**: `React.ComponentType<LucideProps>` matches any Lucide icon component, is self-documenting, and doesn't require consumers to know Lucide's internal type name. Optional rendering means a missing icon renders gracefully — the spec requires this safety.

### Decision: Icon imports colocated in routeMetadata, no external map

**Choice**: Import icons at the top of `routeMetadata.ts`, pass as a third arg to the `route()` helper.
**Alternatives**: Separate `iconMap.ts` (indirection, no benefit with single consumer); wrapper `<Icon>` component (premature abstraction — nav is the sole use case today)
**Rationale**: 11 imports in one file, colocated with the route data they decorate. If icon usage spreads to buttons/cards/statuses in future changes, extraction to a shared wrapper becomes justified — but not now.

### Decision: Icon size 20px

**Choice**: `size={20}` on all nav icons
**Rationale**: Spec requirement. Nav text is `text-sm` (~14px), so 20px icons sit slightly larger than text — standard nav-icon proportion. Lucide default is 24px (too large for inline nav).

## Data Flow

```
routeMetadata.ts              SidebarNav.tsx
┌─────────────────┐           ┌─────────────────┐
│ import {Icon}    │           │ items.map(item) │
│ icon: Icon       │──items──→│   <item.icon     │
│ in route()       │           │    size={20}    │
└─────────────────┘           │    aria-hidden  │
                               │  /> {t(label)} │
                               └─────────────────┘
```

No data flows through `AppShell` or `ProtectedLayout` — they already pass `items` as a prop.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `lucide-react` to dependencies |
| `src/app/routes/routeMetadata.ts` | Modify | Add `icon?` to `ProtectedRouteMeta`, import 11 icons, pass to each route call |
| `src/app/shell/SidebarNav.tsx` | Modify | Render `<item.icon size={20} aria-hidden="true" />` before label inside NavLink |

## Interfaces / Contracts

```typescript
// Added to ProtectedRouteMeta
import type { LucideProps } from "lucide-react";

export type ProtectedRouteMeta = {
  id: ProtectedRouteId;
  path: string;
  href: `${typeof APP_BASE_PATH}/${string}`;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
  icon?: React.ComponentType<LucideProps>; // ← new, optional
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | SidebarNav renders an SVG icon for each route item | Render `<SidebarNav items={mockRoutesWithIcons} />`, assert `svg` elements count matches items |
| Unit | Missing icon does not break layout | Render with `icon: undefined` item, assert no SVG but label renders |

## Migration / Rollout

No migration required. Icon addition is purely additive — no data, no feature flags.

## Icon Mapping

| Route ID | Lucide Icon |
|----------|-------------|
| dashboard | LayoutDashboard |
| properties | Building2 |
| users | Users |
| rooms | DoorOpen |
| roomTypes | Layers |
| guests | UserCheck |
| reservations | CalendarCheck |
| housekeeping | SprayCan |
| maintenance | Wrench |
| billing | Receipt |
| reports | BarChart3 |

## Open Questions

None.
