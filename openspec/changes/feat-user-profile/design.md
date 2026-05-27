# Design: User Profile Page

## Technical Approach

New `src/features/profile/` module following PropertyProfilePage's read/edit pattern (React Hook Form + Zod). Role hierarchy gets a level-10 `any` role, `canAccess()` simplifies to `>=`. Profile link pinned below all sidebar groups via a new `pinnedItem` prop. Property name resolves through a lightweight service against the `properties` table. Strict TDD: RED-GREEN-REFACTOR per layer.

## Architecture Decisions

### Decision: Module Location

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `src/features/profile/` | Separate from users, clean bounded context | ✅ Keep separate |
| `src/features/users/` | Tempting but `users` is future CRUD for staff | ❌ Would conflate self-profile with management |
| `src/features/auth/` | Close to session data | ❌ Pollutes auth with UI concerns |

### Decision: canAccess Simplification

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `>=` with unique levels | No peer logic needed, each role has distinct level | ✅ Adopt |
| Keep current peer-equality | Maintenance/housekeeping share 40 → needs special case | ❌ Unnecessary complexity |

New `ROLE_ORDER`: `any=10`, `maintenance=30`, `housekeeping=40`, `receptionist=50`, `manager=60`, `administrator=70`. `canAccess` becomes `userLevel >= minLevel`. Existing tests for level comparisons MUST be updated (values shift), but behavior semantics hold.

### Decision: Sidebar Pinned Item

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `pinnedItem` prop on `SidebarNav` | Clean separation from groups, explicit API | ✅ Adopt |
| Pseudo-group "pinned" | Forces group rendering for non-group items | ❌ Misuses group semantics |
| Duplicate in settings group | Would appear both grouped and pinned | ❌ Redundant |

Flow: `ProtectedLayout` filters the profile route out of grouped items → passes as `pinnedItem` to `AppShell` → `SidebarNav`. `SidebarNav` renders a `<hr>` separator + pinned link below all groups. The profile route remains in `settingsRoutes` for routing and SettingsLayout tabs.

### Decision: Property Name Resolution

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New `profileService.ts` with `getPropertyNameById` | Lightweight, follows DI pattern, testable | ✅ Adopt |
| Reuse `propertyService.getCurrentProperty` | Already exists but couples profile to property domain | ❌ Cross-domain coupling |
| Derive from session | Session doesn't carry property name | ❌ Not available |

Service queries `properties` table by `propertyId` using same `scopeCurrentPropertyQuery` pattern. Returns `string | null`. Hook wraps it in `loading`/`loaded`/`error` state, same pattern as `useCurrentProperty`.

## Data Flow

```
UserProfilePage (read mode)
  ├── useAuthSession → session (fullName, email, role)
  ├── useCurrentProfile(session) → Hook
  │     └── profileService.getProfileData(session)
  │           ├── fullName, email, role → from session (no query)
  │           └── propertyName → properties table WHERE id = propertyId
  └── ReadOnlyField rows × 4

UserProfilePage (edit mode, admin only)
  └── EditForm
        ├── React Hook Form + Zod (fullName only)
        └── profileService.updateProfileFullName(session, fullName)
              └── profiles table UPDATE WHERE id = profileId
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/auth/types.ts` | Modify | Add `"any"` to `AppProfileRole` union |
| `src/app/routes/routeMetadata.ts` | Modify | Add `any` to `ROLE_ORDER`, simplify `canAccess` to `>=`, add `"profile"` to `ProtectedRouteId` and `settingsRoutes` |
| `src/app/routes/SettingsLayout.tsx` | Modify | Add Profile `<NavLink>` tab |
| `src/app/layouts/ProtectedLayout.tsx` | Modify | Filter profile from grouped items, pass as `pinnedItem` |
| `src/app/shell/AppShell.tsx` | Modify | Pass `pinnedItem` to `SidebarNav` |
| `src/app/shell/SidebarNav.tsx` | Modify | Accept `pinnedItem` prop, render below groups |
| `src/app/routes/routes.tsx` | Modify | Import `UserProfilePage`, map profile route |
| `src/features/profile/UserProfilePage.tsx` | Create | Read/edit page component |
| `src/features/profile/profileService.ts` | Create | DI-based service: `getProfileData`, `updateProfileFullName` |
| `src/features/profile/useCurrentProfile.ts` | Create | Hook: loading/loaded/error state management |
| `src/features/profile/types.ts` | Create | Zod schema, `ProfileData` type |
| `src/features/profile/index.ts` | Create | Public exports |
| `src/features/profile/__tests__/profileService.test.ts` | Create | Service tests with fake query builder |
| `src/features/profile/__tests__/useCurrentProfile.test.ts` | Create | Hook state transition tests |
| `src/features/profile/__tests__/UserProfilePage.test.tsx` | Create | Page rendering & interaction tests |
| `src/shared/i18n/resources/en.ts` | Modify | Add `routes.protected.profile.*` and `profile.*` keys |
| `src/shared/i18n/resources/es.ts` | Modify | Spanish counterparts |

## Interfaces

```typescript
// src/features/profile/types.ts
export type ProfileData = {
  fullName: string | null;
  email: string;
  role: string;
  propertyName: string | null; // resolved from properties table
};

export const profileFormSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
});
export type ProfileFormData = z.infer<typeof profileFormSchema>;
```

Service follows same `PropertyServiceDeps` DI pattern: `profileService.ts` accepts optional `deps` for test injection. Fake query builder identical to propertyService test approach.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit: service** | `getProfileData` success, null session, property name fallback, backend error | DI fakes, same pattern as `propertyService.test.ts` |
| **Unit: hook** | loading→loaded, loading→error, update success/failure, stale request guard | `vi.mock` service, same pattern as `useCurrentProperty.test.ts` |
| **Integration: page** | Read mode render, admin edit toggle, non-admin no edit, validation errors, cancel, backend failure preserves form | `vi.mock` hook + `AuthSessionProvider`, same pattern as `PropertyProfilePage.test.tsx` |
| **Integration: routing** | Profile route accessible to all 6 roles, settings tab renders, pinned item in sidebar | Update existing `App.routing.test.tsx` + `SidebarNav.test.tsx` |
| **Unit: canAccess** | `>=` hierarchy covers all role pairs, any=10 accessible to all | Update existing `canAccess` tests in routing test |

## Migration / Rollout

No migration required. Feature is additive — new routes, new module, modified role helpers. Existing tests MUST pass after role level adjustments (values change but semantics preserve). Rollback: revert types.ts, routeMetadata.ts, remove `src/features/profile/`.

## Open Questions

- None — all decisions resolved in specs and this design.
