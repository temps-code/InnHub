# Proposal: Demo Account Property Selector

## Intent

Improve the demo-account login modal so evaluators and developers can choose a seeded demo property before choosing a role account. This makes manual validation of tenant isolation and RLS behavior explicit from the UI while preserving the existing InsForge authentication flow.

The modal should support the two seeded demo properties:

- Hotel Tarija
- Hostal Los Chapacos

For each property, users should be able to select one of the five existing demo roles:

- Administrator
- Manager
- Receptionist
- Housekeeping
- Maintenance

## Problem Statement

The current demo account selector exposes only five role accounts for one property. After enabling tenant-scoped RLS, issue #96 requires practical evidence that users from different properties can authenticate and only see their own property data. The current modal does not make cross-property demo testing discoverable, even though seed data contains two properties and ten demo accounts.

## Scope

### In scope

- Add an explicit demo property catalog for `hotel-tarija` and `hostal-los-chapacos`.
- Expand demo credentials to cover 10 accounts: 5 roles for each property.
- Update credential helpers to support property-aware lookup and grouping.
- Update `DemoAccountSelector` so users first choose a demo property, then select a role account for that property.
- Keep `LoginForm` using the existing credential submission path.
- Add or update EN/ES i18n copy for the property selector and revised modal guidance.
- Update tests for credential catalog behavior, selector behavior, and login integration.

### Out of scope

- Creating, modifying, or deleting InsForge Auth users.
- Changing RLS policies, database migrations, or seed SQL for this UI feature.
- Trusting the selected UI property as application property scope.
- Creating fake sessions or bypassing the normal InsForge login flow.
- Broad login page redesign or new UI library adoption.
- Fine-grained database RBAC changes.

## Affected Areas

| Area | Expected impact |
| --- | --- |
| `src/features/auth/services/demoCredentials.ts` | Add property-aware demo data and lookup helpers. |
| `src/features/auth/components/DemoAccountSelector.tsx` | Add property selection state and role selection for the active property. |
| `src/features/auth/components/LoginForm.tsx` | Preserve current modal/login integration; update only if copy or test hooks require it. |
| Auth tests | Update assumptions from 5 accounts to 2 properties × 5 roles and cover Hostal credentials. |
| i18n resources | Add/adjust EN/ES keys for property selector labels, descriptions, and modal guidance. |
| OpenSpec auth/i18n/seed-data specs | Later spec phase should capture property-aware demo selector requirements. |

## Proposed UX

Use one modal with two clear sections:

1. **Choose demo property**
   - Hotel Tarija
   - Hostal Los Chapacos
2. **Choose role**
   - Administrator
   - Manager
   - Receptionist
   - Housekeeping
   - Maintenance

Default property: Hotel Tarija.

Selecting a role submits the credentials for the currently selected property and role through the existing `onSelect(credentials)` boundary. The UI must not set or override session property scope; real scope continues to come from the authenticated profile resolved by InsForge and `profiles.auth_user_id`.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| UI-selected property is mistaken for trusted property scope | Keep copy and implementation clear: selector chooses credentials only; authenticated profile determines property scope. |
| Existing tests assume exactly five demo accounts | Update tests to assert two properties, ten accounts, and five roles per property. |
| Credential mapping mistakes break manual RLS validation | Add tests for at least one non-default property and non-admin role, e.g. Hostal Los Chapacos Manager. |
| Diff grows beyond single-review comfort | Keep UX minimal and avoid unrelated login redesign. Pause if implementation diff exceeds 400 changed lines. |
| Mixing with active RLS migration/docs work | Do not edit RLS migration/policy files as part of this feature. Keep this as a separate work unit. |

## Rollback

Rollback is limited to frontend/demo artifacts:

- Restore the previous five-account credential catalog.
- Restore the previous single-list `DemoAccountSelector` UI.
- Revert related i18n and tests.

No database rollback is required because this change does not modify InsForge, migrations, RLS, or seed data.

## Success Criteria

- The demo modal displays both seeded properties.
- Hotel Tarija is selected by default.
- The role list contains the same five demo roles for the selected property.
- Selecting Hotel Tarija + a role submits the matching Tarija demo credentials.
- Selecting Hostal Los Chapacos + a role submits the matching Hostal demo credentials.
- Manual login still uses the existing InsForge authentication path.
- The selector does not create a session, call InsForge directly, or set trusted property scope.
- EN/ES user-facing copy remains aligned.
- Automated tests cover the property catalog, 10-account credential set, property-specific role lookup, selector behavior, and login integration.
- Validation commands pass before reporting implementation complete:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`

## Delivery Strategy

Use a single PR/work unit by default. If implementation or tests exceed the 400-line review budget, pause before apply completion and split follow-up work rather than mixing unrelated changes.
