# Tasks: Multi-Role Demo Login Selector

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~340 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Dependency Graph

```
i18n keys ──────────┐
                    ├──► DemoAccountSelector ──┐
Modal (test first) ─┘                          ├──► LoginForm integration
                                                │      (test first)
DemoAccountSelector test ──────────────────────┘
```

## Phase 1: Foundation — i18n + Modal Shared Primitive

- [x] 1.1 Add `auth.demoSelector` and `auth.roles` keys to `src/shared/i18n/resources/en.ts` (~15 keys)
- [x] 1.2 Add Spanish counterparts to `src/shared/i18n/resources/es.ts` (~15 keys)
- [x] 1.3 (RED) Write `src/shared/components/organisms/__tests__/Modal.test.tsx` — open/close render, Esc key, backdrop click, domain-neutral boundary
- [x] 1.4 (GREEN) Create `src/shared/components/organisms/Modal.tsx` — portal-based overlay, isOpen/onClose/title/children props
- [x] 1.5 Export Modal from `src/shared/components/organisms/index.ts`

## Phase 2: Feature Component — DemoAccountSelector

- [x] 2.1 (RED) Write `src/features/auth/components/__tests__/DemoAccountSelector.test.tsx` — renders 5 roles, each clickable, onSelect returns correct LoginCredentials
- [x] 2.2 (GREEN) Create `src/features/auth/components/DemoAccountSelector.tsx` — consumes `getAllDemoAccounts()`, renders role list with i18n labels, calls `onSelect(credentials)` on click

## Phase 3: Integration — LoginForm Wiring

- [x] 3.1 (RED) Update `src/features/auth/__tests__/LoginForm.test.tsx` — tests: "Demo accounts" button opens modal, role selection calls `login()`, manual login still works
- [x] 3.2 (GREEN) Update `src/features/auth/components/LoginForm.tsx` — replace single demo button with Modal + DemoAccountSelector integration

## Phase 4: Verification

- [x] 4.1 Run `npm run test:run` — all tests pass (old + new)
- [x] 4.2 Run `npm run lint` and `npm run build` — no regressions
