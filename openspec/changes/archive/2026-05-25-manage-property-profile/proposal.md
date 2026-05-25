# Proposal: Manage Property Profile

## Intent

Property managers need to view and update their active property's settings (name, contact info, timezone, currency, etc.). Currently the `/app/properties` route renders a placeholder. This change replaces it with a real form-backed page using the existing auth session, service layer, and shared UI primitives.

## Scope

### In Scope
- Property type + form types (`Property`, `PropertyFormData`)
- `propertyService` with `getCurrentProperty(ctx)` and `updateCurrentProperty(ctx, data)`
- `useCurrentProperty` hook (loading/data/error + update/refresh)
- `PropertyProfilePage` with read/edit toggle using React Hook Form + Zod
- Route swap: `ModulePlaceholderPage` → `PropertyProfilePage`
- i18n labels for property fields (`en`, `es`)
- Tests for service, hook, and page behavior

### Out of Scope
- Multi-property switching or management
- Creating new properties
- Property branding/logo upload
- Cross-property admin features

## Capabilities

> Contract between proposal and specs phases.

### New Capabilities
- `property-profile`: Viewing and editing current property settings (name, business_type, timezone, currency, address, phone, email). Read-only fields: id, slug, created_at, updated_at.

### Modified Capabilities
- None — existing specs (property-scoped-access, service-layer, shared-ui, auth-session, app-routing, database-schema, i18n) already provide the necessary contracts.

## Approach

Replicate the auth module pattern:
- `types.ts` → `Property` + `PropertyFormData` interfaces
- `propertyService.ts` → get/update with `ServiceResult<T>` + `withServiceContext()`
- `useCurrentProperty.ts` → loading/data/error states + `update()` / `refresh()`
- `PropertyProfilePage.tsx` → `PageSection` + read mode / edit toggle via React Hook Form + Zod
- Route swap in `routes.tsx`
- i18n resource keys under `properties.*`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/properties/` | New | Types, service, hook, components, tests |
| `src/app/routes/routes.tsx` | Modified | Swap placeholder for real page |
| `src/shared/i18n/resources/{en,es}.ts` | Modified | Add property field labels |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend missing seeded property for demo user | Low | Handle not-found gracefully in hook |
| `slug` not editable — user confusion | Low | Show as read-only with explanation |
| Line budget may exceed 400 with tests | Medium | Split tests into dedicated task slice |

## Rollback Plan

Revert route change in `routes.tsx` to restore `ModulePlaceholderPage`. Delete `src/features/properties/` module. Revert i18n resource additions.

## Dependencies

- Issue #10 (this issue) references FR-01, FR-16
- Existing service layer: `ServiceResult<T>`, `withServiceContext()`
- Existing scope helpers: `scopeCurrentPropertyQuery()`
- Existing shared UI: `PageSection`, `Button`, `ModuleCard`

## Success Criteria

- [ ] Active property data renders from InsForge in read mode
- [ ] Property settings can be edited and saved via form
- [ ] Data remains scoped by session `property_id`
- [ ] `npm run test:run` passes with new tests
- [ ] `npm run lint` and `npm run build` pass
