# Proposal: Organize Property and Admin Settings

## Intent

### Problem Statement
Currently, InnHub has responsive and routing limitations:
1. The navigation sidebar inside `AppShell.tsx` is fixed at 240px and desktop-only. On mobile screens (< 768px), it stack-renders awkwardly above the layout. There is no hamburger toggle or off-canvas drawer.
2. In `PropertyProfilePage.tsx`, the `ReadOnlyField` layout uses a hardcoded two-column grid that wraps heavily or clips text on screens (< 640px).
3. The routing lacks strict role-based access controls (Role Router Guard) at the layout level.

## Scope

### In Scope
- Define settings/admin nested routes structure.
- Introduce role-based access guard at `ProtectedLayout.tsx` level.
- Refactor `AppShell.tsx` to support stateful off-canvas mobile drawer and backdrop overlay.
- Add mobile hamburger toggle to `TopBar.tsx` using the atomic `Button` component from `src/shared/components/atoms/Button.tsx`.
- Auto-close mobile drawer in `SidebarNav.tsx` on navigation clicks.
- Make read-only and write-only layouts in `PropertyProfilePage.tsx` responsive (vertical stack on mobile, horizontal grid on desktop).

### Out of Scope
- Global state context for AppShell (prop-drilling via layout state is sufficient for MVP).
- Complete refactoring of user administration features outside of routing/access controls.
- Integration of third-party CSS or JS drawer packages.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `app-routing`: Nest Settings routes, introduce a role access guard at ProtectedLayout.tsx level, and support off-canvas mobile drawer with stateful props.
- `property-profile`: Make read-only and write-only layouts responsive, stacking on mobile and grid on desktop.

## Approach
Implement **Stateful Props in AppShell**. Keep state `isSidebarOpen` in `AppShell.tsx` and pass toggle callbacks to children. Use Tailwind CSS off-canvas transitions (`-translate-x-full` to `translate-x-0`).
Update `ReadOnlyField` and edit layouts to `grid-cols-1 sm:grid-cols-[180px_1fr]` in `PropertyProfilePage.tsx` to ensure responsive vertical-to-horizontal scaling.
Enforce role guard inside `ProtectedLayout.tsx` using React Router 7 standard routes definition.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/layouts/ProtectedLayout.tsx` | Modified | Add role protection checks for nested settings routes. |
| `src/app/routes/routes.tsx` | Modified | Nest property/admin settings paths correctly. |
| `src/app/shell/AppShell.tsx` | Modified | Control `isSidebarOpen` state, render off-canvas mobile drawer and backdrop. |
| `src/app/shell/TopBar.tsx` | Modified | Add Menu button (using Button atom) to toggle sidebar drawer. |
| `src/app/shell/SidebarNav.tsx` | Modified | Accept `onClose` callback to hide drawer on link clicks. |
| `src/features/properties/PropertyProfilePage.tsx` | Modified | Apply responsive layout grid to fields (stacking on mobile, grid on desktop). |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mobile overlay layout clipping | Low | Use proper z-index spacing (`z-40` overlay, `z-50` drawer). |
| Accessibility / Focus Trap | Med | Control `overflow-hidden` on body while drawer is open. |

## Rollback Plan
Discard work via `git checkout -- .` and revert the single feature branch.

## Dependencies
- Lucide React (for standard menu icons in toggling).

## Success Criteria
- [ ] No mobile clipping on `PropertyProfilePage.tsx` (fields stack vertically under 640px).
- [ ] Mobile navigation drawer operates via toggle, auto-closes on backdrop click or navigation.
- [ ] Unauthorized users are blocked from admin settings routes by `ProtectedLayout.tsx` guard.
- [ ] All 109 existing tests pass successfully.
