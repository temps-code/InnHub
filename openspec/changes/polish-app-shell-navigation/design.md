# Design: polish app shell navigation

## Overview

This change is a bounded visual polish pass for the protected InnHub app shell. It treats the current uncommitted issue #99 source state as the baseline and creates a separate implementation slice for `polish-app-shell-navigation` without editing `openspec/changes/align-ui-mockups`.

The implementation will refine only the shell frame:

- `AppShell` owns the desktop/mobile shell layout, drawer state, logo/header, sidebar footer property card, and workspace spacing.
- `SidebarNav` owns route group rendering and prototype-aligned nav link states.
- `TopBar` owns active route context and the right-side operational action cluster.
- Tests cover user-observable shell affordances and preserve existing drawer/nav behavior.

No route metadata, auth flow, permissions, backend services, InsForge/RLS, package dependencies, or feature-page business behavior will change.

## Current State and References

Current shell baseline:

- `AppShell` renders a 260px desktop sidebar, mobile drawer/backdrop, sticky `TopBar`, and centered workspace.
- `SidebarNav` renders grouped route links with icon + label and a soft active state.
- `TopBar` renders route title, a generic workspace label, profile text, logout, and `PreferenceBar`.

Prototype references:

- `docs/assets/dashboard-preview.png`
- `docs/assets/room-status-board.png`
- `docs/assets/reservations.png`

The prototypes consistently show:

- a stronger InnHub lockup in the sidebar;
- spacious nav rows with a violet gradient active state;
- a bottom property context card;
- a topbar with title/description on the left;
- a compact right cluster with date, notification/avatar/property context, and screen-specific actions.

This change implements the common shell elements only, not feature-page CTAs or screen content redesigns.

## Design Decisions

### 1. Keep property context presentational and shell-local

Add a static, prototype-aligned property context card in the `AppShell` sidebar footer. It should display localized text such as:

- property name: `InnHub Hotel`
- context/subtitle: `Downtown`
- accessible label: `Current property context`

The card will not be a selector and will not mutate property, role, or permissions. It should be rendered as a non-interactive footer block rather than a button/dropdown.

**Why:** The prototype shows a property selector-like card, but this slice must not introduce unsupported property switching or backend behavior.

### 2. Make active nav state visually stronger without changing navigation contracts

Keep `SidebarNavProps` unchanged:

```ts
export type SidebarNavProps = {
  items: readonly GroupedRouteItem[];
  onClose?: () => void;
  pinnedItem?: ProtectedRouteMeta;
};
```

Refine classes only:

- active link: violet gradient, white text, subtle shadow, readable icon color;
- inactive link: muted text, soft hover surface, visible focus ring;
- spacing: prototype-like row height and rounded corners;
- route destinations and labels: continue from existing route metadata.

**Why:** This satisfies visual alignment while preserving route model and role visibility behavior.

### 3. Topbar action cluster uses non-mutating affordances

`TopBar` will keep its existing props and auth usage:

```ts
type TopBarProps = {
  activeRoute?: ProtectedRouteMeta;
  onToggleSidebar?: () => void;
};
```

Rework the right side into a prototype-like cluster:

- date/context pill, presentational;
- notification affordance with badge, presentational/non-mutating;
- avatar derived from authenticated profile/email when available;
- property pill, presentational;
- existing `PreferenceBar`;
- existing logout button.

Use Lucide icons already available in the project, e.g. `CalendarDays`, `Bell`, `ChevronDown`, `Building2`, or similar. Presentational affordances should be spans/divs with accessible labels/text, not fake clickable buttons.

**Why:** This matches the visual hierarchy while avoiding new behavior or unsupported workflows.

### 4. Prefer route descriptions over generic workspace text

For active routes, `TopBar` should render:

- active route title via `activeRoute.titleKey`;
- supporting description via `activeRoute.descriptionKey`.

When no active route exists, use existing fallback title and workspace label.

**Why:** The prototypes use route-specific subtitles such as operational context. Existing route metadata already provides this without new data contracts.

### 5. Preserve responsive drawer behavior exactly

Do not change drawer state management:

- hamburger opens sidebar;
- backdrop closes sidebar;
- close button closes sidebar;
- clicking a nav link closes sidebar;
- desktop sidebar remains visible.

Visual changes may adjust classes, width, and spacing, but the current open/close class contract should remain stable enough for tests (`translate-x-0` / `-translate-x-full`).

## Data Flow

```text
route metadata -> grouped items -> AppShell -> SidebarNav -> NavLink href/label/icon
                 active route  -> AppShell -> TopBar -> title/description
AuthSessionProvider -> useAuthSession -> TopBar -> profile label/avatar + logout callback
static shell i18n -> AppShell/TopBar -> property/date/notification accessible text
```

No backend or service data is introduced. Property/date/notification shell affordances are presentational for this slice.

## File-Level Plan

### `src/app/shell/AppShell.tsx`

- Keep `useState` drawer state and existing `SidebarNav`/`TopBar` composition.
- Slightly refine desktop grid/sidebar width if needed, targeting the prototype rhythm while staying review-bounded.
- Improve sidebar header lockup classes: larger logo tile, stronger brand text.
- Split sidebar content into:
  - header;
  - scrollable nav area;
  - footer property context card.
- Add localized property-card text via i18n keys.
- Preserve `main` landmark and `aria-label` behavior.

### `src/app/shell/SidebarNav.tsx`

- Keep component props and route rendering logic unchanged.
- Replace soft active state with gradient active state.
- Ensure active/inactive/focus states remain theme-readable.
- Avoid adding test-only attributes unless accessibility requires them.
- Keep pinned item behavior unchanged.

### `src/app/shell/TopBar.tsx`

- Keep `useAuthSession`, `logout`, `activeRoute`, and mobile menu callback.
- Add small local helper for profile initials if needed:
  - derive from full name when available;
  - fall back to email first letter;
  - fall back to `IH` for unauthenticated/intermediate states.
- Render route title and route description/fallback workspace text.
- Replace plain profile text with a compact cluster:
  - date pill;
  - notification presentational badge;
  - avatar;
  - property context pill;
  - logout;
  - preferences.
- Keep mobile behavior compact by hiding lower-priority cluster parts at small breakpoints while keeping logout/preferences reachable.

### `src/app/shell/__tests__/SidebarNav.test.tsx`

Add or adjust tests for user-observable behavior:

- sidebar property context card is visible in `AppShell`;
- active route link receives the stronger active treatment when rendered at an active path;
- mobile drawer open/backdrop close/link close behavior still passes;
- topbar route title and route description render for an active route;
- topbar action cluster exposes date/property/notification/avatar affordances and keeps logout/preferences available.

Avoid brittle tests that assert every utility class. A small class assertion for the active gradient is acceptable only if tied to the requirement that active state is visually stronger; prefer accessible text/labels for the rest.

### `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts`

Add minimal shell keys only if needed, for example:

```ts
shell: {
  sidebar: {
    propertyCard: {
      ariaLabel: "Current property context",
      name: "InnHub Hotel",
      location: "Downtown",
    },
  },
  topbar: {
    dateLabel: "May 15, 2024",
    dateAriaLabel: "Current operating date",
    notificationsLabel: "Notifications",
    propertyLabel: "InnHub Hotel",
    propertyAriaLabel: "Current property",
    avatarAriaLabel: "Current user",
  },
}
```

Spanish equivalents should be added for any new user-visible shell text.

## Strict TDD Plan

Strict TDD is active. Primary test runner: `npm run test:run`.

### RED

Before implementation, update tests to express new requirements:

1. `AppShell` renders the sidebar property context card with accessible/name text.
2. `TopBar` renders active route title and description.
3. `TopBar` renders the compact cluster affordances with accessible names/text and keeps logout/preferences available.
4. `SidebarNav` active link receives the stronger active state at the current path.
5. Existing drawer open/close/link-close tests remain in place.

Run the targeted/full test command and record failing evidence in `apply-progress.md` during apply.

### GREEN

Implement the smallest shell changes to satisfy those tests:

- add i18n keys;
- refine `AppShell`, `SidebarNav`, and `TopBar` classes/markup;
- keep behavior callbacks untouched.

Run `npm run test:run` and record passing evidence.

### REFACTOR/TRIANGULATE

- Extract only small local class/helper constants when they reduce duplication.
- Do not introduce shared UI abstractions unless the implementation becomes clearly repetitive.
- Re-run `npm run test:run` after refactor.

### Final Gates

Before reporting apply complete:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Accessibility Contract

- Sidebar remains a `nav` landmark with existing localized aria label.
- Mobile menu and close controls keep accessible names.
- Presentational topbar affordances must have text or aria labels when their meaning is not visible.
- Do not use fake buttons for non-functional date/notification/property affordances.
- Focus-visible rings remain on actual interactive controls and links.
- Icons used for decoration remain `aria-hidden="true"`.

## Theme and Styling Contract

- Use existing Tailwind utilities and semantic CSS variables.
- Avoid PNG backgrounds, generated prototype HTML, inline scripts, CDN Tailwind config, or new packages.
- Avoid hard-coded single-theme foreground/background pairs that break dark mode.
- If gradient classes are used, pair them with text/focus styling that remains readable.
- Keep dark variants local and minimal where tokenized colors are insufficient.

## Tradeoffs

| Option | Decision | Rationale |
| --- | --- | --- |
| Implement real property/date/notification workflows | Rejected | Out of scope and would require backend/auth/product decisions. |
| Make property card a dropdown/button | Rejected for this slice | Would imply unsupported property switching; presentational card is safer. |
| Move property card into `SidebarNav` props | Rejected initially | `AppShell` owns sidebar chrome/footer; keeping `SidebarNav` focused on links avoids prop churn. |
| Add a new `TopBar.test.tsx` | Optional | Existing shell/preference tests can cover this. Add only if `SidebarNav.test.tsx` becomes too broad. |
| Assert exact Tailwind class strings heavily | Rejected | Brittle and visual-implementation-coupled. Prefer accessible/user-observable assertions, with minimal active-state class coverage if needed. |
| Continue editing `align-ui-mockups` artifacts | Rejected | User requested a new SDD process and separate artifacts. |

## Review Workload Forecast

Target budget: **400 changed lines**.

Expected implementation footprint:

| Area | Forecast |
| --- | ---: |
| `AppShell.tsx` | 40–80 changed lines |
| `SidebarNav.tsx` | 25–60 changed lines |
| `TopBar.tsx` | 70–120 changed lines |
| shell tests | 80–150 changed lines |
| i18n EN/ES | 20–50 changed lines |
| OpenSpec apply progress / verify notes | 30–80 changed lines |

Estimated source/test/i18n diff: **235–460 changed lines**.

Risk: the change can exceed 400 lines if tests are added verbosely or if topbar markup grows. To stay bounded:

- prefer modifying existing shell tests instead of adding broad new suites;
- keep property/date labels static and minimal;
- avoid creating new shared components;
- avoid restyling feature pages;
- pause during apply if the implementation forecast rises above the 400-line budget.

## Rollout and Rollback

Rollout is frontend-only and can ship with the current protected app once tests/lint/build pass. No migration, seed, environment, backend, or deployment configuration changes are required.

Rollback is a normal source revert of:

- `src/app/shell/AppShell.tsx`
- `src/app/shell/SidebarNav.tsx`
- `src/app/shell/TopBar.tsx`
- shell tests changed for this slice
- shell i18n keys added for this slice

No data rollback is needed.

## Open Questions for Apply

- If the source/test diff forecast exceeds 400 changed lines, apply must pause and request a delivery decision instead of silently expanding scope.
- Before archive, confirm whether the new spec domain name `app-shell` should remain canonical or be migrated into an existing domain.