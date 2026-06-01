# Proposal: style(ui): align landing, login, and app shell with generated mockups

## Intent

Align the existing InnHub landing page, login experience, and protected app shell with the Google Stitch visual mockups while preserving the current React, TypeScript, Tailwind, routing, authentication, and responsive shell behavior.

This is a visual alignment slice only. The Stitch export remains a reference for proportions, tokens, layout rhythm, surfaces, and state presentation; its generated HTML must not be copied into the application.

## Problem Statement

The current UI foundation is functional and partially aligned with the prototype direction, but the landing page, login page, shared styling primitives, and app shell do not yet consistently express the Stitch visual system. The main gaps are token consistency, spacing rhythm, typography scale, card depth, and navigation/surface polish across public and protected surfaces.

## Scope

### In scope

- Map the Stitch visual tokens to the existing InnHub styling foundation with controlled CSS variable and Tailwind utility updates.
- Refine public landing layout, hero presentation, sections, cards, and calls to action to better match the mockup direction.
- Refine login page and login form presentation, including form surfaces, input focus states, spacing, and action hierarchy.
- Refine protected app shell surfaces:
  - fixed sidebar width and rhythm;
  - topbar spacing and layering;
  - active, hover, and focus navigation states;
  - responsive drawer behavior styling without changing behavior.
- Reuse the existing stack and shared primitives, especially `Button`, `PageSection`, `ModuleCard`, and shell components.
- Preserve accessibility expectations such as labeled controls, visible focus states, semantic status meaning, and non-color-only cues.
- Keep existing responsive/sidebar tests green and add or update tests only where behavior or test-backed class/state expectations change.

### Out of scope

- Backend, InsForge, database, RLS, auth-flow, permission, route, or session changes.
- Directly porting Stitch-generated HTML, CDN Tailwind configuration, inline scripts, or Chart.js usage.
- Installing a new UI component library or replacing the current styling stack.
- Building new product modules or feature workflows beyond landing, login, and shell visual alignment.
- Changing InnHub domain rules, room state semantics, reservation validation, or data access boundaries.
- Broad redesign of dashboards, data tables, room boards, billing, or reports outside shell-adjacent presentation.

## Affected Areas

| Area | Expected impact |
| --- | --- |
| `src/index.css` | Align semantic colors, typography defaults, shadows, radii, and base document styling with Stitch tokens where appropriate. |
| `src/app/pages/PublicHomePage.tsx` | Adjust landing hero, section rhythm, cards, and CTA hierarchy to match mockup intent. |
| `src/app/pages/LoginPage.tsx` | Refine login page layout, background, card container, and responsive spacing. |
| `src/features/auth/components/LoginForm.tsx` | Refine form field, button, helper, and validation presentation without changing auth behavior. |
| `src/app/shell/AppShell.tsx` | Polish protected layout surfaces, content spacing, and shell layering. |
| `src/app/shell/SidebarNav.tsx` | Align sidebar dimensions, grouped navigation rhythm, active states, hover states, and mobile drawer visuals. |
| `src/app/shell/TopBar.tsx` | Align topbar height, spacing, account context, and elevation/border treatment. |
| `src/shared/components/*` | Update shared primitives only when it reduces duplication and preserves generic, domain-neutral behavior. |
| Existing shell/auth/page tests | Preserve responsive drawer behavior and update tests only for changed, user-observable behavior. |

## Design Direction

Use the Stitch prototype as the visual reference, not as implementation source code.

| Design element | Direction |
| --- | --- |
| Palette | Preserve violet as the primary brand/action color; use light blue-grey canvas and white cards for operational calm. |
| Typography | Favor the documented display/headline/body hierarchy; keep text legible for data-dense administrative screens. |
| Spacing | Use an 8px rhythm with 20px gutters and 32px desktop page margins where shell layout allows. |
| Radius | Keep smaller radii for controls and larger radii for cards/containers. |
| Elevation | Use subtle shadows and tonal layering; avoid heavy decorative depth. |
| Navigation | Keep fixed sidebar plus topbar on desktop and mobile drawer behavior on small screens. |
| Status semantics | Preserve project semantics: occupied uses violet/active, maintenance uses amber/warning, cleaning uses teal/info, and red remains urgent/error. |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Token updates create broad visual regressions | Centralize token changes where possible, keep component-local updates targeted, and verify the three scoped surfaces. |
| Responsive shell behavior regresses while styling the drawer/sidebar | Preserve existing behavior and keep `SidebarNav` tests green. Do not rewrite navigation logic for visual polish. |
| Stitch export is accidentally treated as production source | Use screenshots and `DESIGN.md` only; do not copy generated HTML, CDN config, or scripts into `src/`. |
| Diff exceeds the 400-line review budget | Prefer centralized style primitives. If implementation forecast exceeds 400 changed lines, split into chained slices before apply completion. |
| Visual polish obscures auth or route behavior | Do not change auth submission, protected route rules, demo credential behavior, or session resolution. |
| Accessibility weakens during restyling | Keep visible focus states, labels, contrast, keyboard behavior, and non-color-only state cues. |

## Rollback

Rollback is limited to frontend presentation files:

- Restore prior CSS variables/base styles in `src/index.css`.
- Revert visual changes in the public landing page, login page/form, and shell components.
- Revert any test snapshots or assertions updated only for the visual alignment slice.

No database, backend, migration, auth, route, or seed-data rollback is required because this change must not alter those areas.

## Success Criteria

- Landing, login, and app shell visually align with the Stitch mockup direction for color, spacing, typography, surfaces, and control hierarchy.
- The implementation uses existing React + TypeScript + Tailwind setup and does not add a new UI library.
- No Stitch-generated HTML, CDN Tailwind config, inline scripts, or Chart.js code is copied into the app.
- Existing sidebar mobile drawer behavior, backdrop close behavior, and scroll-container behavior are preserved.
- Authentication, protected routes, permissions, backend calls, and data scope behavior are unchanged.
- Shared UI updates remain generic and presentation-only.
- Accessibility basics remain intact: visible focus states, labeled controls, sufficient contrast, and state cues not relying only on color.
- Strict TDD expectations are followed during apply: update/add regression tests before behavior-affecting changes where applicable.
- Validation commands pass before implementation is reported complete:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`

## Delivery Strategy

Default to one focused work unit for issue #99. The user approved a size exception for the repair pass because the first implementation did not match the prototypes closely enough.

Use the exception narrowly: keep the PR focused on the approved surfaces only, avoid opportunistic polish, and document the final changed-line count in `apply-progress.md` and the PR body.

## Repair Clarification

The repair pass must replace/restructure the weak visual implementation rather than stacking unrelated polish on top of it.

- Login must follow the composition of `docs/assets/login.png`: two-column desktop layout, left product story/module/overview panel, right login card, and stacked responsive layout on smaller screens.
- Login is not dark-first. Colors must come from theme tokens and work in both light and dark themes.
- Landing must follow the composition of `docs/assets/landing.png`: top header/nav, left hero copy, right dashboard-preview-style UI mockup built as real React/Tailwind UI, and module cards below.
- Remove the old foundation/project-status card from landing; it is not part of the prototype.
- Continue to avoid PNG backgrounds, generated Stitch HTML, fake workflows, auth/backend/route/permission changes, and new UI libraries.

## Notes

- Issue: #99
- Change id: `align-ui-mockups`
- Skill resolution: `paths-injected`
- Exploration confirmed Tailwind CSS is already installed/configured and no new UI library is needed.
