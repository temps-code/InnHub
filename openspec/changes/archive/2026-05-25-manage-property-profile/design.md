# Design: Manage Property Profile

## Technical Approach

New `features/properties/` module following the auth module pattern — types, service, hook, page. The page reads the current property from InsForge using the session-derived `property_id`, renders a read-only view, and toggles to an edit form via React Hook Form + Zod. All reads/writes go through `withServiceContext()` + `executeServiceQuery()` for scope enforcement and safe error sanitization. Route swap is a single conditional in `routes.tsx`.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| **Service layer** | `withServiceContext()` vs direct InsForge calls | Direct calls skip scope/error normalization; existing pattern uses context | `withServiceContext()` + `executeServiceQuery()` |
| **Form validation** | RHF + Zod vs plain `useState` (LoginForm) | LoginForm is simpler (2 fields); property form has 7 fields with types | RHF + Zod per proposal |
| **Read/edit toggle** | Single component with `isEditing` vs two components | Two components over-engineer a simple toggle | Single component |
| **Route swap** | Conditional `.map()` vs new route entry | New entry duplicates metadata; conditional is minimal diff | Conditional in current `.map()` |
| **Scope enforcement** | `withServiceContext()` vs manual `propertyId` read | Manual read is one extra dep and bypassable; context is built-in guard | `withServiceContext()` |

## Data Flow

```
PropertyProfilePage
  → useAuthSession() -> session
  → useCurrentProperty(session)
    → propertyService.getCurrentProperty(session)
      → withServiceContext(session, ctx =>
          scopeCurrentPropertyQuery(
            insforge.from("properties").select("*"),
            ctx.propertyScope
          ))
      → executeServiceQuery(query) → ServiceResult<Property>
  ← { property, loading, error }

Edit toggle → RHF + Zod form
  → propertyService.updateCurrentProperty(session, data)
    → withServiceContext(session, ctx =>
        insforge.from("properties").update(data)
          .eq("id", ctx.propertyScope.propertyId))
  → refresh() → back to read mode
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/properties/types.ts` | Create | `Property`, `PropertyFormData`, Zod schema `propertyFormSchema` |
| `src/features/properties/propertyService.ts` | Create | `getCurrentProperty()`, `updateCurrentProperty()` with `withServiceContext` |
| `src/features/properties/useCurrentProperty.ts` | Create | Hook wrapping service + loading/data/error + `update()`/`refresh()` |
| `src/features/properties/PropertyProfilePage.tsx` | Create | Read view + edit toggle with RHF form |
| `src/app/routes/routes.tsx` | Modify | Conditional: `route.id === "properties"` renders `PropertyProfilePage` |
| `src/shared/i18n/resources/en.ts` | Modify | Add `properties.*` field labels |
| `src/shared/i18n/resources/es.ts` | Modify | Spanish translations for property fields |
| `src/features/properties/__tests__/propertyService.test.ts` | Create | Service unit tests with mocked InsForge query |
| `src/features/properties/__tests__/PropertyProfilePage.test.tsx` | Create | Page tests: render, edit toggle, validation, submit |

## Interfaces / Contracts

```typescript
// types.ts — Property follows properties table structure
type Property = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly business_type: string | null;
  readonly timezone: string;
  readonly currency: string;
  readonly address: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly created_at: string;
  readonly updated_at: string;
};

type PropertyFormData = {
  name: string;
  business_type: string | null;
  timezone: string;
  currency: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

// Zod schema mirrors PropertyFormData
const propertyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  timezone: z.string().min(1),
  currency: z.string().length(3),
  email: z.string().email().nullable().or(z.literal("")),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  business_type: z.string().nullable(),
});

// Service signatures
declare function getCurrentProperty(
  session: AppSession | null
): Promise<ServiceResult<Property>>;

declare function updateCurrentProperty(
  session: AppSession | null,
  data: PropertyFormData
): Promise<ServiceResult<Property>>;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Service scope enforcement | Mock `withServiceContext` with null session → expects `property-scope-error` |
| Unit | Service not-found / backend-error | Mock `executeServiceQuery` returns — see existing test pattern |
| Unit | Hook state transitions | Mock service, verify loading→data and loading→error flows |
| Integration | Page read render | Mock `getCurrentProperty`, verify fields displayed |
| Integration | Edit toggle + form validation | RHF `handleSubmit` with invalid data → inline errors |
| Integration | Successful submit flow | Valid data → submit → verify `updateCurrentProperty` called with form data |

Follow existing test conventions: `describe`/`it`/`expect` from Vitest, gateway-like inline mocks, `expectNoSecretText` for error safety.

## Migration / Rollout

No migration required. The existing `/app/properties` route renders a placeholder — swap is purely presentational. Rollback: revert the conditional in `routes.tsx`, delete `src/features/properties/`, revert i18n additions.

## Open Questions

- [ ] Confirm the InsForge `properties` table column names match the `Property` type above (especially `business_type`, `slug`, and Timestamp type casing)
- [ ] Does the demo user seed include a valid property row? Required for the page to render meaningful data — if not, seed data must be added
