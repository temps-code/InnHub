# Tasks: UI Icon System for Navigation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~100–150 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Foundation

- [x] 1.1 Install `lucide-react` as npm dependency (`npm install lucide-react`)
- [x] 1.2 Verify build still passes after install (`npm run build`)

## Phase 2: Core Implementation

- [x] 2.1 Extend `ProtectedRouteMeta` with `icon?: React.ComponentType<LucideProps>` in `src/app/routes/routeMetadata.ts`
- [x] 2.2 Import 11 Lucide icons and add icon mapping to each route entry in `src/app/routes/routeMetadata.ts`
- [x] 2.3 [RED] Write failing test: verify SidebarNav renders an `svg` for each route item with an icon
- [x] 2.4 [GREEN] Update `SidebarNav.tsx` to render `<item.icon size={20} aria-hidden="true" />` before the label inside NavLink
- [x] 2.5 [REFACTOR] Clean up spacing/styling between icon and label text

## Phase 3: Testing

- [x] 3.1 Write test: SidebarNav renders icon for each route with `icon` defined (assert `svg` count matches items)
- [x] 3.2 Write test: SidebarNav does not break when `icon` is undefined (no SVG rendered, label still shows)
- [x] 3.3 Run full test suite (`npm run test:run`) and confirm all pass

## Phase 4: Verification

- [x] 4.1 Run `npm run build` — confirm no TypeScript errors
- [x] 4.2 Run `npm run lint` — confirm no lint violations
- [ ] 4.3 Visual check: navigate sidebar in dev mode, verify each icon renders correctly
