## Exploration: Property and Admin Settings Organization

### Current State
Currently, InnHub's layout and routing have some responsive and architectural limitations:
1. **Desktop-Only Sidebar**: The main application shell (`AppShell.tsx`) uses a fixed 240px wide sidebar navigation on desktop (rendered with `md:grid md:grid-cols-[240px_1fr]`). On mobile screens (< 768px), the layout falls back to standard block rendering, placing the sidebar content directly above the top header and main panel in an awkward, non-responsive stacked block layout. There is no mobile-friendly off-canvas drawer or toggle mechanism.
2. **Hardcoded Read-Only Grid in Property Profile**: In `PropertyProfilePage.tsx`, the `ReadOnlyField` component is styled using a fixed `grid grid-cols-[180px_1fr] gap-2 text-sm` layout. On mobile screens (< 640px), the fixed 180px column constraint causes labels to wrap heavily or clip, breaking the vertical rhythm and looking highly unpolished.
3. **Menu Interaction and Atomic Design**: The app provides a reusable `Button` component in `src/shared/components/atoms/Button.tsx` that supports multiple variants (`primary`, `secondary`, `ghost`, `danger`) and sizes (`sm`, `md`, `lg`). The top bar does not use a toggle button for the mobile sidebar navigation, nor does it reuse any existing shared atoms for mobile actions.

### Affected Areas
- `src/app/shell/AppShell.tsx` — Manage mobile sidebar state (`isOpen`) and render the off-canvas drawer layout, responsive sidebar container, and mobile overlay backdrop.
- `src/app/shell/TopBar.tsx` — Add a mobile menu toggle button leveraging the `Button` atom (with standard `ghost` variant) and trigger the open/close handler.
- `src/app/shell/SidebarNav.tsx` — Call a close handler (`onClose`) when any `NavLink` is clicked on mobile so the drawer automatically closes on navigation.
- `src/features/properties/PropertyProfilePage.tsx` — Refactor the `ReadOnlyField` layout to use a responsive grid (`grid-cols-1 sm:grid-cols-[180px_1fr]`), letting elements stack cleanly on mobile.
- `src/app/routes/SettingsLayout.tsx` — (Observation check) Sub-navigation settings bar uses inline flex wraps but could benefit from proper spacing adjustments for mobile touch targets.

### Approaches

1. **Stateful Props in AppShell (Recommended)**
   - **Description**: Add state (`isSidebarOpen: boolean`) in `AppShell.tsx` using `useState`. Pass a toggle callback to `TopBar` and a close callback to both the mobile overlay backdrop and `SidebarNav`. Configure the responsive sidebar container via off-canvas Tailwind classes: `fixed inset-y-0 left-0 z-50 w-64 transform -translate-x-full transition-transform duration-300 md:relative md:translate-x-0` and set `md:grid md:grid-cols-[240px_1fr]` on the main outer wrapper.
   - **Pros**:
     - Light, readable, and highly localized to the Shell hierarchy.
     - Avoids adding custom global context files or hooks.
     - Extremely robust and easy to implement and verify.
   - **Cons**:
     - Requires passing two props down to `TopBar` and `SidebarNav`.
   - **Effort**: Low-Medium

2. **AppShell State Provider / Context**
   - **Description**: Create a dedicated React context `AppShellContext` with a custom hook `useAppShell` to govern sidebar visibility. `TopBar` and `SidebarNav` consume the hook directly rather than receiving state as props.
   - **Pros**:
     - Eliminates prop-drilling inside the shell.
     - Allows deeply nested features to programmatically open/close the sidebar.
   - **Cons**:
     - Over-engineered for a simple MVP application where the layout structure is flat and static.
     - Increases bundle size and cognitive load.
   - **Effort**: Medium

### Recommendation
We recommend **Approach 1: Stateful Props in AppShell**. This approach provides the cleanest alignment with the existing structure. It leverages declarative Tailwind CSS classes for responsive design (off-canvas drawer transformation on small viewports and standard sidebar layout on desktop) and utilizes simple state-passing. 
For `ReadOnlyField` in `PropertyProfilePage.tsx`, the layout should be updated to a responsive grid container `grid-cols-1 sm:grid-cols-[180px_1fr]`.
To respect atomic design, the mobile toggle button in `TopBar` will be built by wrapping a Lucide icon (`Menu` or `X`) inside the reusable `Button` atom configured with the `ghost` variant and standard padding.

### Risks
- **Touch Latency / Visual Flickers**: Off-canvas transitions on iOS/Android browsers can flicker if not properly transitioned with hardware acceleration (`transform-gpu` or `will-change-transform`).
- **Focus Trapping**: For accessibility (ARIA guidelines), an open off-canvas mobile drawer should ideally trap keyboard focus. We must ensure the overlay backdrop is fully interactive and standard document scrolling is managed when open (e.g. `overflow-hidden` on `body` when open).
- **Z-Index Layering**: The off-canvas drawer must overlay page content and the TopBar correctly. The backdrop must be configured with `z-40` and the drawer with `z-50` to avoid clipping underneath features or popovers.

### Ready for Proposal
Yes — The codebase is well-structured and fully supports implementing these responsive sidebar drawer additions and layout corrections. The orchestrator should proceed to define and launch the `sdd-propose` and subsequent phases.
