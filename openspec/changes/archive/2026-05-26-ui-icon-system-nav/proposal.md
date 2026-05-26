# Proposal: UI Icon System for Navigation

## Intent

Sidebar navigation currently renders only text labels, making it harder for users to identify sections at a glance. Adding icons improves module recognition and scanning speed without changing navigation behavior.

## Scope

### In Scope
- Install `lucide-react` as the icon library
- Extend `ProtectedRouteMeta` to include an `icon` field
- Map each of the 11 protected routes to a fitting Lucide icon
- Update `SidebarNav` to render icons alongside labels
- Document shared icon usage pattern for navigation, buttons, cards, statuses, and empty states
- Run tests and build to verify nothing breaks

### Out of Scope
- Navigation grouping or headers (#61)
- Settings section restructuring (#58)
- Role-based visibility filtering (#60)
- Check-in/check-out as separate routes
- Any feature implementation beyond icon visuals

## Capabilities

### New Capabilities
- `icon-system`: Icon library integration (lucide-react) and shared usage conventions for navigation items, action buttons, status indicators, module cards, and empty states

### Modified Capabilities
- `shared-ui`: Relax "no icon package" restriction to permit lucide-react for navigation icon use; all other prohibitions (Storybook, modal/table/form systems) remain

## Approach

1. Install `lucide-react` via npm
2. Extend `ProtectedRouteMeta` type in `src/app/routes/routeMetadata.ts` with `icon?: React.ComponentType<LucideProps>`
3. Map each route to a Lucide icon (dashboard → LayoutDashboard, properties → Building2, users → Users, rooms → DoorOpen, roomTypes → Layers, guests → UserCheck, reservations → CalendarCheck, housekeeping → SprayCan, maintenance → Wrench, billing → Receipt, reports → BarChart3)
4. Update `SidebarNav` to render the icon component before the i18n label
5. Document icon conventions in a brief section (share under `icon-system` capability)
6. Run `npm run build` and `npm run test:run`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/routes/routeMetadata.ts` | Modified | Add `icon` field to type and route entries |
| `src/app/shell/SidebarNav.tsx` | Modified | Render Lucide icon before label |
| `openspec/specs/shared-ui/spec.md` | Modified | Relax no-icon-package restriction |
| `openspec/specs/icon-system/spec.md` | New | Icon usage conventions |
| `package.json` | Modified | Add lucide-react dependency |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bundle size increase from icon library | Low | lucide-react is tree-shakeable; verify via build output |
| TypeScript strictness on icon prop type | Low | Use `React.ComponentType<LucideProps>` from lucide-react types |

## Rollback Plan

- `npm uninstall lucide-react`
- Revert `routeMetadata.ts` and `SidebarNav.tsx` changes
- Remove `icon-system` spec and revert `shared-ui` spec
- All tests return to pre-change state

## Dependencies

- `lucide-react` (no other external deps)

## Success Criteria

- [ ] lucide-react installed and `npm run build` succeeds
- [ ] Every protected route has an associated icon in metadata
- [ ] Sidebar renders icons correctly alongside labels
- [ ] All existing tests pass (`npm run test:run`)
- [ ] Icon conventions documented in `icon-system` spec
