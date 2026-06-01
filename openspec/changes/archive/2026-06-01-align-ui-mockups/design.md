# Design — align-ui-mockups

Align issue #99 as a presentation-only visual slice: centralize mockup-inspired tokens, refine the public landing/login surfaces, and polish the authenticated shell while preserving existing routing, auth, permissions, and responsive drawer behavior.

## Decision Summary

| Area | Decision |
| --- | --- |
| Scope | Limit implementation to landing, login, shared presentation primitives, and authenticated shell styling. |
| Source of truth | Use `docs/prototype/stitch-ai-export/DESIGN.md`, screenshots, proposal, and specs as visual references only. Do not copy generated HTML, CDN Tailwind config, scripts, or chart code. |
| Styling stack | Keep the current React + TypeScript + Tailwind CSS v4 setup (`@tailwindcss/vite`, `@import "tailwindcss"`, CSS custom properties in `src/index.css`). |
| Token approach | Extend/refine semantic CSS variables and Tailwind arbitrary-value usage instead of adding a UI library or introducing hard-coded one-off palettes across components. |
| Component approach | Reuse and lightly enhance existing primitives (`Button`, `PageSection`, `ModuleCard`) and shell components. Avoid large rewrites. |
| Behavior | Preserve route paths, protected-route redirects/guards, role-filtered navigation, auth form submission, logout, preference controls, and drawer state transitions. |
| Testing | Strict TDD remains active. Add/update tests before implementation when visual changes affect test-backed state/class contracts or accessibility-visible states. Run `npm run test:run` as the required regression gate. |
| Delivery | Target one focused PR under the 400-line review budget; auto-slice into chained PRs if implementation forecast or actual diff exceeds budget. |

## Current State Observations

- Tailwind CSS is already configured through `@tailwindcss/vite` in `vite.config.ts` and `@import "tailwindcss"` in `src/index.css`.
- `src/index.css` already defines light/dark semantic variables for background, surface, heading, text, muted, primary, primary-soft, border, and panel shadow.
- Public pages and shell already use Tailwind utilities with CSS variables, so alignment can be incremental.
- `AppShell` owns mobile drawer open/close state and renders the sidebar, topbar, backdrop, and workspace.
- `SidebarNav.test.tsx` currently asserts drawer translation classes, backdrop close, link close, scroll wrapper classes, and sidebar flex layout; these are preservation contracts.
- `LoginForm` already preserves real auth behavior through `useAuthSession()`, validates required fields, supports demo account selection, and exposes alerts.

## Technical Approach

### 1. Token and base style alignment

Refine `src/index.css` first so downstream component changes stay small.

Planned token direction:

| Token family | Direction |
| --- | --- |
| Canvas | Keep a light blue-grey operational canvas close to Stitch `surface/background` while maintaining dark-mode equivalents. |
| Surface | Keep white/light cards in light mode and slate surfaces in dark mode. |
| Primary | Preserve violet as brand/action/active color; tune `--color-primary` and `--color-primary-soft` only if contrast remains sufficient. |
| Border/outline | Use subtle blue-grey borders for cards, inputs, topbar, and sidebar. |
| Shadows | Keep subtle ambient shadows for panels; avoid decorative heavy depth. |
| Shape | Use smaller radii for controls/inputs and larger radii for cards/containers. |
| Typography | Continue Inter/system fallback already configured; do not add webfont loading in this slice. Use Tailwind text sizes/weights to approximate the Stitch hierarchy. |

Implementation should prefer semantic variables such as `var(--color-background)` and `var(--shadow-panel)` over repeated literal colors. If new semantic variables are needed, keep them generic, for example `--color-surface-raised`, `--color-focus-ring`, or `--shadow-interactive`.

### 2. Reusable visual primitives

Update shared primitives only when it reduces repeated styling in scoped pages.

| Primitive | Likely refinement | Contract to preserve |
| --- | --- | --- |
| `Button` | Align radius, hover, focus ring, secondary/outline hierarchy, and disabled states with mockup direction. | Native `<button>`, `type`, `disabled`, `aria-busy`, variants, sizes, and caller `className` merging. |
| `PageSection` | Tune panel radius, padding, heading scale, surface depth, and responsive spacing. | Optional `aria-labelledby`, title levels, `quiet`/`panel` variants, actions slot, children slot. |
| `ModuleCard` | Improve card surface, hover border/depth, icon well, and compact rhythm. | Domain-neutral article card with optional eyebrow, description, icon, action. |
| `PreferenceBar` | Usually no change except spacing if needed by page/shell placement. | Theme/language controls and accessible labels. |

Avoid creating a broad design-system abstraction unless implementation duplication proves it is needed inside this slice.

### 3. Landing page alignment

`src/app/pages/PublicHomePage.tsx` should remain a public, semantic landing page.

Planned changes:

- Keep `<main aria-labelledby="app-title">` and the existing translated content.
- Adjust page width, hero spacing, icon/card depth, headline scale, CTA hierarchy, and foundation section rhythm.
- Reuse `Button` styling only if links can be styled consistently without changing link semantics; otherwise keep accessible `<Link>` elements with matching classes.
- Keep `/login` and `/app/dashboard` link destinations unchanged.
- Do not add fake marketing workflows, backend-driven content, or prototype-generated sections outside the approved landing scope.

### 4. Login page and form alignment

`src/app/pages/LoginPage.tsx` and `src/features/auth/components/LoginForm.tsx` should retain all auth behavior.

Planned changes:

- Refine page background, centered card width, card radius/depth, and responsive padding.
- Improve form field visual hierarchy: label spacing, input radius, background, hover/focus border, and focus ring.
- Keep labels associated by `htmlFor`/`id`.
- Keep required-field and generic auth error behavior exactly as-is, including `role="alert"`.
- Keep demo account modal behavior and submit loading/disabled behavior.
- Do not change redirect resolution, credentials handling, provider usage, or session state.

### 5. Authenticated shell alignment

`src/app/shell/AppShell.tsx`, `SidebarNav.tsx`, and `TopBar.tsx` should be polished without changing navigation behavior.

Planned changes:

| Component | Visual changes | Behavior to preserve |
| --- | --- | --- |
| `AppShell` | Adopt fixed 260px-ish desktop sidebar rhythm, tonal canvas, refined drawer/backdrop layering, and 32px desktop workspace margins where practical. | `isSidebarOpen`, backdrop close, close button, link-close path, `<main id="app-workspace">`, active route aria label. |
| `SidebarNav` | Improve group spacing, active/hover/focus states, icon alignment, pinned profile divider, and mobile drawer surface. | `NavLink` active-state logic, translated labels, route metadata source, optional `onClose`, optional `pinnedItem`. |
| `TopBar` | Refine height, bottom border/elevation, title hierarchy, account context spacing, preference/logout grouping, and mobile menu affordance. | Mobile toggle callback, logout call, profile label fallback, active title rendering, `PreferenceBar` presence. |

Do not change route metadata, role-based route filtering, unauthorized direct URL handling, auth session resolution, or protected layout boundaries.

## Data and Control Flow

This change must not introduce new data flow.

```text
User route -> React Router -> existing page/layout
  Public: PublicHomePage or LoginPage
  Protected: ProtectedLayout/AppShell -> SidebarNav + TopBar + workspace children

Auth interactions stay unchanged:
LoginForm -> useAuthSession().login(credentials) -> onAuthenticated redirect
TopBar logout -> useAuthSession().logout()

Preference interactions stay unchanged:
PreferenceBar -> existing theme/language controls
```

Styling data flow should be:

```text
src/index.css semantic variables
  -> Tailwind arbitrary value utilities / component classes
  -> shared primitives and scoped page/shell surfaces
```

## Files Likely Affected

| File | Expected change |
| --- | --- |
| `src/index.css` | Token/base style refinements and optional generic focus/elevation variables. |
| `src/shared/components/atoms/Button.tsx` | Button visual tuning only. |
| `src/shared/components/organisms/PageSection.tsx` | Panel and heading rhythm tuning only. |
| `src/shared/components/molecules/ModuleCard.tsx` | Card surface/hover/icon rhythm tuning only. |
| `src/app/pages/PublicHomePage.tsx` | Landing hero, CTA, section, and card layout refinements. |
| `src/app/pages/LoginPage.tsx` | Login shell/card/background refinements. |
| `src/features/auth/components/LoginForm.tsx` | Form/input/error/demo action visual refinements only. |
| `src/app/shell/AppShell.tsx` | Layout, drawer surface, backdrop, sidebar container, workspace spacing. |
| `src/app/shell/SidebarNav.tsx` | Nav item/group active/hover/focus visual states. |
| `src/app/shell/TopBar.tsx` | Header spacing, account/action cluster, mobile menu visual treatment. |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Only update/add tests if class/state contracts are intentionally adjusted. |
| `src/app/__tests__/App.routing.test.tsx` | Preserve route/access coverage; update only if visual assertions are test-backed. |
| `src/app/__tests__/PreferenceIntegration.test.tsx` | Preserve preference control presence on public pages and topbar. |
| Shared primitive tests | Update only if tests assert classes that change as part of visual contracts. |

## Accessibility and Responsive Constraints

- Preserve semantic landmarks: public/login `<main>`, shell `<aside>`, `<header>`, and workspace `<main id="app-workspace">`.
- Keep all form controls labelled and keyboard reachable.
- Keep visible `focus-visible` states for buttons, links, inputs, drawer close/open controls, and nav items.
- Maintain sufficient contrast in light and dark themes for primary, muted, border, and error states.
- Preserve non-color-only cues where status/error meaning appears; login errors keep text plus alert role.
- Preserve mobile drawer contracts: toggle opens, backdrop closes, link closes, close button closes, and nav scroll remains independent.
- Maintain desktop fixed-fluid shell direction with a stable sidebar width and fluid workspace.
- Keep responsive padding practical: about 16px mobile, 20px gutters, 32px desktop workspace margins where layout allows.
- Do not replace drawer with bottom navigation in this issue, even though the prototype mentions it as a possible mobile adaptation.

## TDD and Verification Plan

Strict TDD applies during implementation.

1. RED: Before changing behavior-backed class/state contracts, add or update focused tests that express the intended preserved behavior or visible state.
2. GREEN: Apply the smallest visual change that satisfies the test and preserves existing contracts.
3. TRIANGULATE: Verify landing, login, and shell surfaces share tokens/primitives rather than one-off styling.
4. REFACTOR: Remove duplicated visual classes only when it keeps the diff smaller and behavior clearer.

Required verification before reporting implementation complete:

```bash
npm run test:run
npm run lint
npm run build
```

For the design phase only, no app code is implemented and no test run is required.

## Tradeoffs

| Tradeoff | Choice | Reason |
| --- | --- | --- |
| Exact mockup fidelity vs. current stack | Prefer close alignment within current Tailwind/CSS variable setup. | Avoids copying generated code and keeps review/maintenance manageable. |
| New font loading vs. existing font stack | Keep current Inter/system stack. | Prevents asset/dependency work in a visual alignment slice; typography can approximate hierarchy with size/weight. |
| Global tokens vs. local classes | Centralize stable semantics, keep page-specific layout local. | Reduces broad regressions while avoiding premature design-system expansion. |
| Screenshot/visual tests vs. DOM regression tests | Use existing Vitest/Testing Library behavior tests. | Project has no screenshot test infrastructure; strict TDD should protect user-observable behavior, not pixel-match mockups. |
| Single PR vs. chain | Start single PR, split if over budget. | Scope should be reviewable if token and primitive changes stay centralized. |

## Explicit Non-goals

- No backend, InsForge, database, migration, seed, RLS, or service work.
- No auth-flow, permission, redirect, role hierarchy, or session-state changes.
- No new UI component library, CSS framework, charting library, icon library, or Tailwind CDN config.
- No direct port of Stitch-generated HTML, inline scripts, generated classes, Chart.js snippets, or prototype-only code.
- No new product modules, fake dashboards, fake records, operational workflows, or placeholder business logic.
- No broad redesign of dashboards, tables, billing, reports, room boards, or feature workflows beyond shell-adjacent presentation.
- No Tailwind installation/configuration changes unless a current setup defect is found during apply.
- No commits, pushes, PRs, or branch operations unless explicitly requested.

## Rollout and Rollback

Rollout is frontend-only:

1. Token/base style alignment.
2. Shared primitive visual refinements.
3. Landing/login visual alignment.
4. Shell/sidebar/topbar visual alignment.
5. Regression verification.

Rollback is limited to reverting presentation changes in `src/index.css`, shared primitives, scoped pages, shell components, and any visual-contract test updates. No backend or data rollback is required.

## Review Workload Forecast

| Slice | Estimated changed lines | Risk |
| --- | ---: | --- |
| Tokens/base CSS | 30–70 | Low |
| Shared primitives | 40–100 | Low/Medium |
| Landing + login | 120–220 | Medium |
| Shell/sidebar/topbar | 140–260 | Medium/High |
| Test updates | 40–120 | Medium |

Overall forecast: **370–770 changed lines** depending on how much class churn is needed.

400-line budget risk: **Medium/High**.

Chained PR recommendation: **Auto-forecast split if implementation exceeds budget**.

Preferred chain if needed:

```text
PR 1: Tokens and shared primitives
  -> PR 2: Landing and login visual alignment
    -> PR 3: Shell/sidebar/topbar visual alignment
```

Each slice should keep tests with the visual contracts it affects. If the diff remains under 400 changed lines, keep it as one focused work unit.

## Repair Clarification — prototype composition fidelity

The initial apply improved styling but did not reproduce the prototype compositions closely enough. The repair pass should replace/restructure the affected pages, not pile unrelated visual tweaks on top.

### Login composition

`docs/assets/login.png` is the composition target for login.

Required direction:

- Use a two-column desktop layout: product story/preview on the left, login card on the right.
- Stack the same content responsively on smaller screens without breaking form behavior.
- Include real UI representations for core modules and an operations overview panel on the left side.
- Keep the actual login form, validation, demo account modal, redirect behavior, and auth hooks unchanged.
- Do not make login dark-first. Use semantic tokens so light and dark themes both render correctly.
- Avoid hard-coded light-only gradients that break dark mode.

### Landing composition

`docs/assets/landing.png` is the composition target for landing.

Required direction:

- Add/restore the top header with logo and simple anchors/nav labels matching the prototype intent.
- Use a two-column hero: copy/CTAs on the left and a dashboard-preview-style UI mockup on the right, implemented as real React/Tailwind markup.
- Render module cards below the hero in the same conceptual row/grid as the prototype.
- Remove the foundation/project-status card; it is implementation-history copy and is not part of the product landing prototype.
- Keep `/login` and `/app/dashboard` destinations unchanged.

### Delivery exception

The user approved a single PR with a size exception for this repair. Keep the exception bounded to issue #99 surfaces and document the final changed-line count.

## SDD Notes

- Issue: #99
- Change id: `align-ui-mockups`
- Skill resolution: `paths-injected`
- Artifact store: OpenSpec
