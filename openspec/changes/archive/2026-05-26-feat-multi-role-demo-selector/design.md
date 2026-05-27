# Design: Multi-Role Demo Login Selector

## Technical Approach

Three-layer addition: (1) a domain-neutral Modal organism in shared UI, (2) a DemoAccountSelector feature component that renders demo roles from `getAllDemoAccounts()`, and (3) wiring in LoginForm to replace the single env-var-driven button with a modal-driven role picker.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Role descriptions | Local i18n key map in DemoAccountSelector | Modify `DemoAccount` type | Kept service layer unchanged; i18n alignment with project pattern |
| Login on role select | Direct `submitCredentials(creds)` call | Auto-fill email/password fields + trigger submit | Reuses existing flow; avoids coupling form state with selector lifecycle |
| Modal focus | Basic auto-focus on mount, no focus-trap lib | Full focus-trap (focus-trap-react) | Not spec'd; no added dependency; extensible later if needed |
| Modal title | Prop rendered as `<h2>` in content area | Separate slot, no title | Spec requires `title` prop; `<h2>` maps to section heading role |

## Data Flow

```
LoginForm
  │
  ├─ "Demo accounts" button click
  │    └─► Modal (isOpen=true)
  │           └─► DemoAccountSelector
  │                  ├─ getAllDemoAccounts() → role list
  │                  └─ onSelect(credentials)
  │                       └─► LoginForm.submitCredentials(credentials)
  │                              └─► useAuthSession().login(credentials)
  │                                     └─► AuthSessionProvider → insforgeGateway
  │
  └─ Manual email/password submit (unchanged)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/components/organisms/Modal.tsx` | Create | Portal-based overlay with backdrop, Esc/click-close, title + children |
| `src/shared/components/organisms/__tests__/Modal.test.tsx` | Create | Tests: open/close render, Esc, backdrop click, boundary check |
| `src/shared/components/organisms/index.ts` | Modify | Add Modal export |
| `src/features/auth/components/DemoAccountSelector.tsx` | Create | Role list from `getAllDemoAccounts()`, i18n labels, onSelect callback |
| `src/features/auth/components/__tests__/DemoAccountSelector.test.tsx` | Create | Tests: renders 5 roles, selection calls onSelect, no network |
| `src/features/auth/components/LoginForm.tsx` | Modify | Replace demo button + section with Modal + DemoAccountSelector integration |
| `src/features/auth/__tests__/LoginForm.test.tsx` | Modify | Update demo flow tests: opener button, selector interaction |
| `src/shared/i18n/resources/en.ts` | Modify | Add `auth.demoSelector` and `auth.roles` translation keys |
| `src/shared/i18n/resources/es.ts` | Modify | Add Spanish counterparts |

## Interfaces / Contracts

```tsx
// Modal — domain-neutral, no auth/property imports
interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
}

// DemoAccountSelector — feature component, consumes auth types
interface DemoAccountSelectorProps {
  readonly onSelect: (credentials: LoginCredentials) => void;
}

// LoginForm — updated props (no change from current)
interface LoginFormProps {
  readonly onAuthenticated: () => void;
  readonly demoCredentials?: DemoCredentialsResult;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit — Modal | Open/close render, Esc key, backdrop click, no click-through, no domain imports | Vitest + RTL, `screen`, `fireEvent.keyDown`, `createPortal` |
| Unit — DemoAccountSelector | Lists all 5 accounts, each clickable, onSelect returns correct credentials, no real auth calls | Mock `getAllDemoAccounts` or test with real data, verify onSelect args |
| Integration — LoginForm | "Demo accounts" button opens modal, selecting a role triggers `login()`, manual login still works | Wrap in `AuthSessionProvider` + `I18nextProvider`, use mock gateway |

## Migration / Rollout

No migration required. Old `resolveDemoCredentials()` and env-var path kept as fallback for backward compat but no longer the primary UI entry. Remove old `demoCredentials` prop from `LoginForm` in a follow-up once the multi-role path is validated.

## Open Questions

None.

## Estimated Effort

~180 lines new, ~40 lines modified across 7 files. 3 new test suites (~120 lines). Total: ~340 lines.
