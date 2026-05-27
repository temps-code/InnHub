# Proposal: Multi-Role Demo Login Selector

## Intent

LoginForm has a single "Use demo account" button driven by `VITE_DEMO_LOGIN_EMAIL`/`VITE_DEMO_LOGIN_PASSWORD` env vars. `getAllDemoAccounts()` already exposes credentials for all 5 roles (administrator, manager, receptionist, housekeeping, maintenance), but there's no UI to select between them. Evaluators and devs can't test role-specific behavior without editing env vars.

## Scope

### In Scope
- Reusable Modal component in `src/shared/components/organisms/Modal.tsx`
- DemoAccountSelector listing all 5 roles with credential info
- LoginForm integration: replace single demo button with a selector trigger
- Tests for Modal, DemoAccountSelector, and updated LoginForm

### Out of Scope
- Property selection (each role has 2 profiles — property is resolved via session, not user choice)
- Registration, password reset, or self-service onboarding
- Backend/InsForge changes or new API endpoints
- Styling beyond existing Tailwind 4 primitives and CSS vars

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `shared-ui`: Add Modal component requirement (lift previous scope guard on modal system at `openspec/specs/shared-ui/spec.md`)
- `auth-session`: Update visible demo login requirement from single env-var-driven button to multi-role selector calling the existing login boundary

## Approach

- Build a generic Modal (overlay + backdrop + close on Esc/click-outside) as a shared organism under `src/shared/components/organisms/Modal.tsx` — domain-neutral, no auth imports
- Build DemoAccountSelector in `src/features/auth/components/` consuming `getAllDemoAccounts()` from demoCredentials.ts
- On role click, call `login()` via the existing `useAuthSession` hook — no new auth paths
- Replace the single "Use demo account" button in LoginForm with a "Demo accounts" button that opens the Modal > DemoAccountSelector
- Test Modal independently, DemoAccountSelector with mock credentials, LoginForm with integration

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/components/organisms/Modal.tsx` | New | Reusable modal overlay primitive |
| `src/shared/components/organisms/index.ts` | Modified | Export Modal |
| `src/features/auth/components/DemoAccountSelector.tsx` | New | Role picker listing 5 accounts |
| `src/features/auth/components/LoginForm.tsx` | Modified | Replace single demo button with selector trigger |
| `src/shared/components/index.ts` | Modified | Re-export Modal from organisms |
| `openspec/specs/shared-ui/spec.md` | Modified | Lift modal-system prohibition, add Modal req |
| `openspec/specs/auth-session/spec.md` | Modified | Update demo login requirement to multi-role |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Modal violates existing shared-ui "MUST NOT add modal system" | Med | Explicitly modify shared-ui spec as part of this change |
| Role selector drifts into property-picker territory | Low | Deferred by scope; credentials only, property comes from session |

## Rollback Plan

Revert LoginForm.tsx to the single env-var-driven button pattern. Remove DemoAccountSelector and Modal.tsx. No schema, backend, or env var changes needed.

## Dependencies

- `getAllDemoAccounts()`, `getDemoAccount(role)` already exist in `src/features/auth/services/demoCredentials.ts`
- `useAuthSession` hook already provides `login()`

## Success Criteria

- [ ] Modal renders overlay + content + closes on Esc key and backdrop click
- [ ] DemoAccountSelector lists all 5 roles from `getAllDemoAccounts()`
- [ ] Selecting a role auto-fills credentials and triggers `login()` through the existing auth session boundary
- [ ] LoginForm still supports manual email/password submission
- [ ] `npm run test:run` passes with new tests for Modal, DemoAccountSelector, and LoginForm integration
- [ ] `npm run lint` and `npm run build` pass
