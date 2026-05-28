# Proposal: User Profile Page

## Intent

Issue #67 — Provide a page where authenticated users can view their profile info (name, email, role, property). Admins can edit their name. No such interface exists today.

## Scope

### In Scope
- UserProfilePage at `/app/settings/profile` with read-only display for all roles
- Edit mode (name only) for administrator role
- Role hierarchy adjustment: add base level 10, simplify `canAccess()` to `>=`
- Profile link in sidebar as pinned item + SettingsLayout tab
- Property name resolution from session `propertyId`
- i18n keys for profile labels

### Out of Scope
- Edit for non-admin roles (receptionists, housekeeping, etc.)
- Password change, email change, role change
- Avatar/photo upload
- User management CRUD (that's the `users` feature)

## Capabilities

### New Capabilities
- `user-profile`: View profile data (fullName, email, role, property name). Read-only for all roles. Edit name for administrator only. Follows PropertyProfilePage read/edit pattern (React Hook Form + Zod).

### Modified Capabilities
- `app-routing`: Role hierarchy needs base level 10 (`any`), `canAccess()` simplified to `>=` only, new `ProtectedRouteId` (`"profile"`), profile route in `settingsRoutes` with `minRole: 10`, sidebar pinned item for "My Profile" below settings group.

## Approach

New `src/features/profile/` module. UserProfilePage with read/edit toggle via React Hook Form + Zod + ReadOnlyField. Property name resolved via a lightweight service querying properties table by session `propertyId`. Add `"any"` (level 10) to `AppProfileRole` union. Update `ROLE_ORDER`. Simplify `canAccess()` to `>=`. Add profile route to `settingsRoutes` with `minRole: 10`. Sidebar gets pinned "My Profile" item. SettingsLayout gets Profile tab. New i18n keys under `routes.protected.profile.*`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/auth/types.ts` | Modified | Add `any` to AppProfileRole, ROLE_ORDER entry for level 10 |
| `src/app/routes/routeMetadata.ts` | Modified | Add profile to ProtectedRouteId, settingsRoutes, simplify canAccess |
| `src/app/routes/SettingsLayout.tsx` | Modified | Add Profile tab |
| `src/app/shell/SidebarNav.tsx` | Modified | Add pinned "My Profile" item |
| `src/features/profile/` | New | UserProfilePage, profile service, tests |
| i18n resources | Modified | New keys for profile fields |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `canAccess()` simplification breaks existing role checks | Medium | Parameterized tests over all 6 roles before applying change |
| Property name resolution fails | Low | Show property ID as fallback label |

## Rollback Plan

Revert role hierarchy changes in `types.ts` and `routeMetadata.ts`. Remove profile route and sidebar link. Delete `src/features/profile/`. Restore original `canAccess()` and `ROLE_ORDER`.

## Dependencies

- None. This change is self-contained and builds on the current role/auth/routing foundation.

## Success Criteria

- [ ] Profile page renders read-only data for all authenticated roles
- [ ] Admin can toggle edit mode, update name, persist changes
- [ ] Non-admin roles see read-only mode (no edit button)
- [ ] Sidebar shows "My Profile" link for all roles
- [ ] SettingsLayout has Profile tab
- [ ] `npm run test:run` passes with coverage for role-based access, read/edit modes, and property name resolution
