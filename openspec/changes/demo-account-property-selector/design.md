# Design: Demo Account Property Selector

## Overview

The demo account modal will become property-aware while keeping authentication and property scope unchanged. The selector will let users choose one seeded demo property, then choose one of the five seeded role accounts for that property. Selecting a role will still call the existing `onSelect(LoginCredentials)` callback and `LoginForm` will still submit those credentials through `useAuthSession().login()`.

This change is intentionally frontend-only. It does not create sessions, set trusted property scope, call InsForge directly, or modify RLS/database artifacts. The authenticated app session continues to derive `propertyId` from the linked `profiles.auth_user_id` record after InsForge authentication succeeds.

## Goals

- Make both seeded demo properties discoverable in the login modal.
- Resolve demo credentials from `(propertyId, role)` instead of role only.
- Preserve the existing manual-login and demo-login auth boundary.
- Keep copy localized in English and Spanish.
- Support manual RLS smoke testing by making same-role cross-property login easy.
- Stay within a single review unit unless implementation exceeds the 400-line review budget.

## Non-Goals

- Creating or modifying InsForge Auth users.
- Changing RLS policies, database migrations, or seed SQL.
- Trusting the UI-selected property as application/session property scope.
- Adding fake sessions, local auth bypasses, or direct InsForge calls from JSX.
- Implementing database RBAC for roles.
- Redesigning the full login page.

## Affected Files

| File | Change |
| --- | --- |
| `src/features/auth/services/demoCredentials.ts` | Add demo property types/catalog, 10 accounts, property-aware lookup helpers, and backwards-compatible role lookup if needed. |
| `src/features/auth/components/DemoAccountSelector.tsx` | Add selected-property state, property controls, active-property styling, and role list filtered by selected property. |
| `src/features/auth/components/LoginForm.tsx` | Preserve integration; likely only uses updated i18n description and unchanged `DemoAccountSelector onSelect` boundary. |
| `src/shared/i18n/resources/en.ts` | Add/update property selector labels, role selector labels, property names, and guidance copy. |
| `src/shared/i18n/resources/es.ts` | Spanish counterpart for all new/changed selector copy. |
| `src/features/auth/__tests__/demoCredentials.test.ts` | Update tests for 2 properties, 10 accounts, five roles per property, and property-specific lookup. |
| `src/features/auth/components/__tests__/DemoAccountSelector.test.tsx` | Test property controls, default property, role rendering, and Hostal credential selection. |
| `src/features/auth/__tests__/LoginForm.test.tsx` | Test modal guidance and that Hostal role selection still authenticates through the existing login flow. |

No RLS migration, database migration, seed SQL, or InsForge configuration files are part of this feature.

## Data Model

Add explicit demo property identity so the selector cannot infer property from display labels or email strings.

```ts
export type DemoPropertyId = "hotel-tarija" | "hostal-los-chapacos";

export type DemoProperty = {
  readonly id: DemoPropertyId;
  readonly nameKey: string;
};

export type DemoAccount = {
  readonly propertyId: DemoPropertyId;
  readonly role: AppProfileRole;
  readonly email: string;
  readonly password: string;
};
```

Recommended constants:

```ts
const DEFAULT_DEMO_PROPERTY_ID: DemoPropertyId = "hotel-tarija";

const DEMO_PROPERTIES: readonly DemoProperty[] = [
  { id: "hotel-tarija", nameKey: "auth.demoSelector.properties.hotelTarija" },
  { id: "hostal-los-chapacos", nameKey: "auth.demoSelector.properties.hostalLosChapacos" },
];
```

Credential catalog should contain exactly 10 accounts:

- Hotel Tarija:
  - `admin+tarija-admin@innhub.dev`
  - `admin+tarija-manager@innhub.dev`
  - `admin+tarija-reception@innhub.dev`
  - `admin+tarija-housekeep@innhub.dev`
  - `admin+tarija-maintenance@innhub.dev`
- Hostal Los Chapacos:
  - `admin+loschapacos-admin@innhub.dev`
  - `admin+loschapacos-manager@innhub.dev`
  - `admin+loschapacos-reception@innhub.dev`
  - `admin+loschapacos-housekeep@innhub.dev`
  - `admin+loschapacos-maintenance@innhub.dev`

Recommended helpers:

```ts
export function getAllDemoProperties(): readonly DemoProperty[];
export function getAllDemoAccounts(): readonly DemoAccount[];
export function getDemoAccountsForProperty(propertyId: DemoPropertyId): readonly DemoAccount[];
export function getDemoAccountForProperty(
  propertyId: DemoPropertyId,
  role: AppProfileRole,
): LoginCredentials | undefined;
```

Compatibility option:

```ts
export function getDemoAccount(role: AppProfileRole): LoginCredentials | undefined;
```

If kept, `getDemoAccount(role)` should default to `DEFAULT_DEMO_PROPERTY_ID` so older tests/callers keep deterministic behavior. New selector code should use `getDemoAccountForProperty` or `getDemoAccountsForProperty` explicitly.

## Component State and Flow

`DemoAccountSelector` remains a presentational component:

```ts
export type DemoAccountSelectorProps = {
  readonly onSelect: (credentials: LoginCredentials) => void;
};
```

Internal state:

```ts
const [selectedPropertyId, setSelectedPropertyId] = useState<DemoPropertyId>(DEFAULT_DEMO_PROPERTY_ID);
```

Render flow:

1. Load demo properties from `getAllDemoProperties()`.
2. Render property controls under a localized label such as `auth.demoSelector.propertyLabel`.
3. Render role controls from `getDemoAccountsForProperty(selectedPropertyId)` under `auth.demoSelector.roleLabel`.
4. When a property is selected, update only local UI state.
5. When a role account is selected, call:

```ts
onSelect({ email: account.email, password: account.password });
```

The component MUST NOT:

- import or create an InsForge client;
- call `login()` directly;
- pass a `propertyId` to `onSelect`;
- store selected property anywhere outside selector UI state;
- modify auth/session context.

## UI and Accessibility

Use the existing Tailwind/CSS-variable style pattern from `DemoAccountSelector`.

Recommended structure:

- A compact property selector section with two buttons/cards.
- A role selector section with five buttons/cards for the active property.
- Active property should be visibly distinct, e.g. stronger border/background.
- Active property control should expose programmatic state with `aria-pressed={selected}`.
- Each property button should have an accessible name from i18n property name text.
- Each role button should keep role label, role description, and email context visible.

Do not add a new UI dependency or new shared primitive unless implementation proves current primitives are insufficient.

## I18n Plan

Use resource-backed strings only. Avoid inline user-facing dictionaries in JSX.

Add or update keys under `auth.demoSelector`, for example:

```ts
demoSelector: {
  title: "Demo accounts",
  description: "Choose a demo property and role. The signed-in profile determines the actual property scope.",
  openButton: "Demo accounts",
  propertyLabel: "Choose demo property",
  roleLabel: "Choose role",
  properties: {
    hotelTarija: "Hotel Tarija",
    hostalLosChapacos: "Hostal Los Chapacos",
  },
}
```

Spanish keys should communicate the same meaning and avoid implying that the UI property selection overrides authenticated profile/RLS scope.

Existing `auth.roles.*` labels/descriptions can remain the source for role labels and descriptions.

## Login Integration

`LoginForm` should remain the owner of modal open/close and credential submission.

Current flow should be preserved:

1. User opens modal with `auth.demoSelector.openButton`.
2. Modal renders `DemoAccountSelector`.
3. `DemoAccountSelector` calls `onSelect(credentials)`.
4. `LoginForm.handleDemoSelect` closes the modal and calls `submitCredentials(credentials)`.
5. `submitCredentials` calls `login(credentials)` from `useAuthSession()`.
6. `AuthSessionProvider`/auth services resolve user profile and property scope from InsForge and `profiles.auth_user_id`.

No changes are expected in `AuthSessionProvider`, auth gateways, or service context.

## Testing Strategy

OpenSpec config has `strict_tdd: true`, so apply should start with failing tests before implementation.

### RED tests

1. `demoCredentials.test.ts`
   - `getAllDemoProperties()` returns Hotel Tarija and Hostal Los Chapacos.
   - `getAllDemoAccounts()` returns 10 accounts.
   - Each supported property has exactly five roles.
   - `getDemoAccountForProperty("hostal-los-chapacos", "manager")` returns `admin+loschapacos-manager@innhub.dev`.
   - Unknown role or invalid property handling remains safe/deterministic where applicable.

2. `DemoAccountSelector.test.tsx`
   - Renders both property options.
   - Defaults to Hotel Tarija.
   - Renders five role options for the selected property.
   - Selecting Administrator with default property submits Tarija admin credentials.
   - Selecting Hostal Los Chapacos then Manager submits Hostal manager credentials and not Tarija manager credentials.
   - Component does not perform network/auth calls; it only calls `onSelect`.

3. `LoginForm.test.tsx`
   - Modal opens with updated property/role guidance.
   - Selecting Hostal Los Chapacos + Manager triggers `signInWithPassword` with Hostal manager credentials through the existing gateway mock.
   - Existing manual login validation and invalid-login behavior remain unchanged.

### GREEN implementation

- Add data model and helpers.
- Update selector state/rendering.
- Update i18n copy.
- Adjust tests for changed 5-account assumptions.

### TRIANGULATE

- Include at least one assertion for the non-default property and a non-admin role.
- Keep default Tarija assertion to catch regressions in compatibility behavior.

### Final validation

Run before reporting complete:

```bash
npm run test:run
npm run lint
npm run build
```

Expected known warnings may remain if unrelated to this change, but failures should be fixed before handoff.

## Tradeoffs

### Keep `onSelect(LoginCredentials)` instead of `onSelect(account)`

**Chosen.** This preserves the existing auth boundary and avoids leaking UI property selection into the login/session layer.

Tradeoff: tests must inspect selected credentials rather than richer account metadata, but this is safer because property scope remains profile-derived.

### Keep `getDemoAccount(role)` with Tarija default

**Recommended for compatibility.** Existing tests or future callers may still expect role-only lookup. New code should prefer explicit property-aware helpers.

Tradeoff: role-only lookup can hide the fact there are two properties, so tests should prioritize the explicit helper.

### Store i18n keys in property catalog

**Chosen.** Property names are user-facing and must be EN/ES resource-backed.

Tradeoff: the credential service now knows translation key names. This is acceptable for static demo metadata; alternatively the component could map property IDs to keys locally, but that duplicates catalog knowledge.

### Use one modal with sections instead of a two-step wizard

**Chosen.** It keeps the flow fast for evaluators and keeps the diff small.

Tradeoff: the modal has more visible controls at once, but only two properties and five roles are present, so cognitive load remains low.

### Tenant smoke-test support, not RLS verification automation

**Chosen.** This UI enables manual RLS validation. It does not automate cross-user database assertions.

Tradeoff: final RLS evidence still requires manual checks/screenshots or separate integration tooling.

## Review Risk

Implementation risk is low-to-medium:

- Low backend risk: no database or InsForge changes.
- Low auth risk: login boundary remains unchanged.
- Medium test churn: existing tests assume five demo accounts and must be updated carefully.
- Medium UX/i18n risk: new copy must be bilingual and must not imply trusted UI property scope.

Estimated implementation diff:

| Area | Estimated changed lines |
| --- | ---: |
| Credential service + tests | 80-130 |
| Selector UI + tests | 100-170 |
| LoginForm test/i18n | 40-90 |
| Total implementation | 220-390 |

This fits the selected single-PR default and 400-line review budget if scope remains focused. Pause before apply completion if the implementation diff exceeds 400 changed lines excluding OpenSpec artifacts, or if RLS/database files become necessary unexpectedly.

## Rollout and Validation

1. Implement under `features` branch with RLS migration/docs work preserved.
2. Run automated checks.
3. Manually test in the deployed/local app:
   - Hotel Tarija + Manager logs in and shows Hotel Tarija data.
   - Hostal Los Chapacos + Manager logs in and shows Hostal Los Chapacos data.
   - Refresh a protected route after each login.
4. Use the modal and property-specific sessions as screenshot evidence for issue #96.

## Rollback

Rollback is a frontend revert only:

- restore the previous single-property `DEMO_ACCOUNTS` list;
- restore the previous role-only selector;
- revert related i18n and tests.

No InsForge, migration, or RLS rollback is required for this feature.
