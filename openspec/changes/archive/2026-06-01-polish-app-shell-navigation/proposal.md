# Proposal: polish app shell navigation

## Intent

Polish the protected InnHub application shell so the sidebar, topbar, and shell container more closely match the generated internal-system prototypes while preserving the current behavior, routing, authentication, permissions, and data boundaries.

This is a new SDD change separate from `align-ui-mockups` to avoid continuing to expand the existing issue #99 artifacts. The current uncommitted issue #99 source changes are treated as the visual baseline for this follow-up shell-only slice.

## Problem Statement

The current protected app shell is functional and already improved from the original baseline, but it still reads as a generic application scaffold compared with the generated prototypes in:

- `docs/assets/dashboard-preview.png`
- `docs/assets/room-status-board.png`
- `docs/assets/reservations.png`

The remaining gaps are concentrated in the shell, not in feature content:

1. The sidebar lacks the stronger active gradient state, bottom property-card treatment, and premium spacing rhythm shown in the prototypes.
2. The topbar action cluster does not match the prototype hierarchy of date pill, notification affordance, avatar, property context, and compact account controls.
3. The shell container can better express the prototype layering with clearer desktop width, surface, border, and spacing rhythm.

## Scope

### In scope

- Refine protected app shell presentation only:
  - `src/app/shell/AppShell.tsx`
  - `src/app/shell/SidebarNav.tsx`
  - `src/app/shell/TopBar.tsx`
- Update shell tests where needed, especially accessible interaction and preserved responsive drawer behavior:
  - `src/app/shell/__tests__/SidebarNav.test.tsx`
- Add or adjust minimal shell i18n keys if labels are required for user-visible shell affordances.
- Preserve the existing route metadata model and use current route icons/labels.
- Keep the mobile drawer behavior intact: hamburger opens, backdrop closes, close button closes, nav link closes.
- Keep the change bounded to a single PR with an intended review budget of **400 changed lines or less**. If implementation forecast exceeds this, pause before apply completion and request a delivery decision.

### Out of scope

- No backend, InsForge, database, RLS, migration, seed, or service changes.
- No auth-flow, logout behavior, session resolution, route, permission, or role-visibility changes.
- No dashboard, rooms, reservations, billing, reports, or feature-page content redesigns.
- No new UI libraries, package changes, generated prototype HTML, CDN Tailwind configuration, inline scripts, or PNG-as-background implementation.
- No edits to `openspec/changes/align-ui-mockups` artifacts.
- No broad token redesign unless a small shell-local class adjustment is insufficient.

## Affected Areas

| Area | Expected impact |
| --- | --- |
| `src/app/shell/AppShell.tsx` | Improve shell grid width, layout rhythm, sidebar container layering, and main workspace spacing while preserving drawer state and landmarks. |
| `src/app/shell/SidebarNav.tsx` | Add higher-fidelity nav states, active gradient emphasis, icon/text rhythm, hover/focus styling, and bottom property-card treatment. |
| `src/app/shell/TopBar.tsx` | Rework the right-side action cluster toward prototype hierarchy: date pill, notification icon, avatar/property context, preference controls, and logout without changing behavior. |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Add/update tests for user-observable shell affordances and ensure existing drawer interactions remain green. |
| `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts` | Minimal shell label additions only if needed for accessible/user-visible topbar or property-card text. |

## Design Direction

Use the prototypes as visual references, not implementation source code.

- Sidebar should feel like the prototype SaaS shell: strong InnHub lockup, spacious module links, active violet gradient state, soft hover states, and a bottom property card.
- Topbar should prioritize the current route title and route description on the left, with a compact operational action cluster on the right.
- Property/date/notification/avatar affordances may be presentational in this slice as long as they are accessible and do not imply unsupported workflows.
- Logout and preference controls must remain available for the current MVP/demo workflow.
- Styling should use existing Tailwind utilities, semantic CSS variables, and Lucide icons already in the project.
- Dark/light theme compatibility must be preserved through existing theme tokens and dark variants where necessary.

## TDD and Validation Approach

Strict TDD remains active for apply.

1. **RED**: Add or adjust shell tests first for user-observable expectations, such as the property-card label, topbar action labels, preserved mobile drawer open/close behavior, and accessible icon buttons.
2. **GREEN**: Refactor shell visuals to satisfy tests without changing route/auth/session behavior.
3. **TRIANGULATE/REFACTOR**: Deduplicate shell class strings only where it keeps the code readable and bounded.
4. **Final gates**:
   - `npm run test:run`
   - `npm run lint`
   - `npm run build`

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Scope creep into feature pages | Limit implementation to shell components, shell tests, and minimal i18n. Do not touch feature pages or services. |
| Review budget exceeds 400 changed lines | Forecast before apply completion; if likely to exceed the budget, stop and request a delivery decision. |
| Existing uncommitted issue #99 work is accidentally mixed with artifact changes | Treat current source as baseline, create only `polish-app-shell-navigation` artifacts, and do not edit `align-ui-mockups`. |
| Topbar presentational controls imply unsupported behavior | Keep date/notification/property affordances clearly presentational or non-mutating unless existing behavior already supports them. |
| Accessibility regresses during visual polish | Preserve labeled buttons, visible focus rings, semantic navigation landmarks, and keyboard-accessible drawer controls. |
| Auth/session behavior changes while restyling account controls | Reuse existing `useAuthSession` state and `logout` callback without changing auth logic. |

## Rollback

Rollback is frontend-only:

- Revert changes in `src/app/shell/AppShell.tsx`, `src/app/shell/SidebarNav.tsx`, and `src/app/shell/TopBar.tsx`.
- Revert shell-specific test and minimal i18n updates made for this change.
- No database, backend, auth, routing, permissions, or seed rollback is required because those areas are out of scope.

## Success Criteria

- Protected app shell visually aligns more closely with the generated prototypes for sidebar, topbar, spacing, layering, and active navigation state.
- Sidebar includes a stronger active state and property-card treatment without changing route visibility or navigation behavior.
- Topbar presents route context and a prototype-like action cluster while keeping logout and preferences available.
- Mobile drawer behavior remains unchanged and test-covered.
- No auth, backend, route, permission, service, or feature-page content changes are introduced.
- No new dependencies or generated prototype code are added.
- Changed-line forecast remains within the 400-line review budget, or implementation pauses for a delivery decision before exceeding it.
- `npm run test:run`, `npm run lint`, and `npm run build` pass before the change is reported complete.

## SDD Execution Notes

Configured SDD phase models for the follow-up fast-forward:

- `sdd-explore`: `openai-codex/gpt-5.3-codex`
- `sdd-proposal`: `openai-codex/gpt-5.5`
- `sdd-spec`: `openai-codex/gpt-5.3-codex`
- `sdd-design`: `openai-codex/gpt-5.5`
- `sdd-tasks`: `openai-codex/gpt-5.3-codex`
- `sdd-apply`: `openai-codex/gpt-5.3-codex`
- `sdd-verify`: `openai-codex/gpt-5.5`

## Notes

- Change id: `polish-app-shell-navigation`
- SDD mode requested by user: `sdd-ff`, auto, OpenSpec artifacts, bounded single PR, 400-line review budget.
- Skill resolution: `fallback-registry` from prior failed phase; no explicit skill paths were injected into this delegated proposal task.
