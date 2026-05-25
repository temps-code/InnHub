## Exploration: Manage Property Profile

### Current State

**Routes & Navigation:**
The `/app/properties` route already exists in `src/app/routes/routeMetadata.ts` and is registered in the sidebar navigation. Currently it renders the generic `ModulePlaceholderPage` with placeholder i18n copy. The route is fully wired through `ProtectedLayout` → `AppShell` → `SidebarNav`.

**Auth & Session:**
The auth module (`src/features/auth/`) provides `useAuthSession()` which exposes an `AuthSessionState` discriminated union. When authenticated, `state.session` contains an `AppSession` with `propertyId: string`. The `TopBar` already accesses `state.session.profile` and `state.session.user`. The `PropertyOwnerTables` list in `propertyScope.ts` does NOT include `properties` — it is treated as a root table accessed via `scopeCurrentPropertyQuery()` (filter by `id`).

**Service Layer Foundation:**
- `ServiceResult<T>`, `ServiceError`, `executeServiceQuery()` in `src/shared/services/serviceResult.ts`
- `PropertyScope`, `scopeCurrentPropertyQuery()` in `src/shared/services/propertyScope.ts`
- `ServiceContext`, `withServiceContext()` in `src/shared/services/serviceContext.ts`
- `createInsForgeClient()` in `src/shared/services/insforgeClient.ts`
- These provide the full foundation for property-scoped, testable service operations.

**Shared UI:**
`Button`, `StatusBadge`, `PageSection`, `ModuleCard`, `MetricCard` exist under `src/shared/components/`. The `PageSection` component provides heading, description, actions slot, and content area — ideal for the property profile page.

**Properties Feature Area:**
`src/features/properties/` exists with only `.gitkeep`. No services, hooks, components, or types exist yet.

**Database Schema (properties table):**
From `database/migrations/001_define_core_innhub_schema.sql`:
```sql
create table properties (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    business_type text,
    timezone text not null default 'UTC',
    currency text not null default 'USD',
    address text,
    phone text,
    email text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

Editable fields (read from user perspective): `name`, `business_type`, `timezone`, `currency`, `address`, `phone`, `email`. Read-only/derived: `id`, `slug`, `created_at`, `updated_at`.

**i18n:**
Existing keys for properties route in both `en.ts` and `es.ts`:
- `routes.protected.properties.{label,title,description}` — for navigation and placeholder
- No property-specific field labels exist yet

### Affected Areas

```
src/
├── features/
│   └── properties/                        # NEW — feature module
│       ├── types.ts                       # Property type, form data types
│       ├── services/
│       │   └── propertyService.ts         # Read/update operations via InsForge
│       ├── hooks/
│       │   └── useCurrentProperty.ts      # Hook providing current property data + actions
│       ├── components/
│       │   ├── PropertyProfileForm.tsx     # Edit form for property fields
│       │   └── PropertyProfilePage.tsx     # Page composing view + edit states
│       └── __tests__/
│           ├── propertyService.test.ts     # Service tests with fake query builder
│           └── PropertyProfilePage.test.tsx # Page/component integration tests
├── app/
│   ├── routes/
│   │   └── routes.tsx                     # Replace ModulePlaceholderPage with PropertyProfilePage
│   └── providers/
│       └── AppProviders.tsx               # No changes needed (auth already provides session)
└── shared/
    └── i18n/
        └── resources/
            ├── en.ts                      # Add property field labels, form copy
            └── es.ts                      # Add Spanish counterpart

docs/
├── 05-architecture.md                     # No changes needed (pattern already defined)
└── 05-architecture.es.md                  # No changes needed

openspec/
└── changes/
    └── manage-property-profile/           # OpenSpec change artifacts
        ├── exploration.md                 # THIS FILE
        ├── proposal.md                    # (next phase)
        ├── specs/
        ├── design.md
        ├── tasks.md
        └── apply-progress.md
```

### Approaches

1. **Full Profile Page with Read + Edit Form (Recommended)** — Standard feature module following auth pattern
   - A dedicated feature page at `/app/properties` with:
     - Read mode: displays property details in a structured layout
     - Edit mode: inline form using React Hook Form + Zod validation
     - Service layer: `propertyService.ts` with `getCurrentProperty()` and `updateCurrentProperty()`
     - Hook: `useCurrentProperty()` wrapping service calls with loading/error/data states
     - Property scope: use `withServiceContext()` + `scopeCurrentPropertyQuery()`
   - Pros: Complete solution, follows existing patterns (service → hook → component), testable, proper validation, property-scoped
   - Cons: Larger implementation, more files to review
   - Effort: Medium (est. 350-500 lines across all files)

2. **Read-Only Profile View with Edit Toggle** — Simpler, inline toggle
   - Same service/hook foundation as approach 1, but page starts in read-only
   - Edit mode toggles fields to editable inline (no separate form, no modal)
   - Uses simpler local state toggle instead of React Hook Form for minimal validation
   - Pros: Simpler UI, fewer components, less code
   - Cons: Less robust validation, harder to test, React Hook Form is already a project dependency so underusing it
   - Effort: Low-Medium (est. 250-350 lines)

3. **Full CRUD Property Management** — Beyond MVP scope
   - Multiple properties, property selector, create/delete property
   - Pros: More complete feature
   - Cons: Out of MVP scope (FR-01 says "manage property profile", not multi-property management; each user belongs to ONE property in MVP), violates `PROPERTY_ROOT_TABLES` pattern, far exceeds workload budget
   - Effort: Very High (est. 800+ lines)
   - **Rejected**: Out of MVP scope per docs/02-mvp-scope.md and docs/03-domain-model.md

### Recommendation

**Approach 1 — Full Profile Page with Read + Edit Form (following auth module pattern).**

Rationale:
1. **FR-01 compliance**: "Manage property profile and operational settings" — requires both viewing and editing. Approach 2's inline toggle is acceptable but less clean for the "manage" requirement.
2. **Existing patterns**: The auth module's gateway/service/hook/component pipeline is well-established and should be replicated. `withServiceContext()` + `scopeCurrentPropertyQuery()` already provide the property-scoped access pattern.
3. **React Hook Form + Zod are already dependencies**: Using them for the edit form is the right call instead of underusing them with approach 2.
4. **Testability**: Service with fake query builder, hook with fake service, component with Testing Library — follows the established TDD pattern.
5. **Review workload**: Estimated 350-500 lines fits a single PR within the 400-line budget (may need minor split if tests push it over).

Specific implementation guidance:
- `types.ts`: Define `Property` type matching the DB schema, and `PropertyFormData` for edit payloads
- `propertyService.ts`: 
  - `getCurrentProperty(context)` — use `scopeCurrentPropertyQuery()` on `properties` table
  - `updateCurrentProperty(context, data)` — use `scopeCurrentPropertyQuery()` on update, return `ServiceResult`
- `useCurrentProperty.ts`: Standard loading/data/error pattern, expose `property`, `isLoading`, `error`, `update(data)`, `refresh()`
- `PropertyProfilePage.tsx`: Uses `PageSection`, composes view display + `PropertyProfileForm` in edit mode
- Routes: Swap `ModulePlaceholderPage` for `PropertyProfilePage` for the properties route only

### Risks

- **Backend data may not exist**: The InsForge backend is configured but may not have a seeded `properties` row for the demo user. The service should handle `not-found` gracefully and show a clear message. This is expected to be resolved by seed data (issue #8).
- **SDK query shape**: The exact PostgREST `.single()` vs `.maybeSingle()` availability in the installed `@insforge/sdk` needs to be confirmed during apply (same pattern as auth gateway).
- **`business_type` values**: The schema uses `text` for `business_type` with no enum constraint. We should either define allowed values in the form schema or keep it as free text.
- **`slug` is not editable**: By design it's unique and should be set at creation time. The form must not allow editing it. This is a deliberate constraint.
- **Review budget**: The estimate of 350-500 lines may exceed the 400-line budget if tests are extensive. A split into Work Unit A (service/hook/types) and Work Unit B (page/form/routing) is a safe fallback.

### Ready for Proposal

Yes — the exploration is thorough. The codebase has all the necessary foundations:
- ✅ Property route exists in metadata and navigation
- ✅ Auth session provides `propertyId`
- ✅ Service layer foundation (`ServiceResult`, `withServiceContext`, `scopeCurrentPropertyQuery`)
- ✅ InsForge client configured
- ✅ Shared UI primitives (`Button`, `PageSection`)
- ✅ Established feature module pattern (auth module)
- ✅ i18n pattern for bilingual resources
- ✅ Database migration with `properties` table applied
- ✅ Strict TDD expected (`openspec/config.yaml`)

The orchestrator should tell the user: "Exploration complete. The codebase is ready for the proposal phase. Estimated implementation effort is medium (350-500 lines across ~10 files). Recommend following the auth module's gateway→service→hook→component pattern, using React Hook Form + Zod for the edit form, and leveraging `withServiceContext` + `scopeCurrentPropertyQuery` for property-scoped access."
