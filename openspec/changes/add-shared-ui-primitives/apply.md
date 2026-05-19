# SDD Apply — add-shared-ui-primitives

## Status

partial-pass — PR 1 core primitives implemented

## Delivery Strategy

Issue #22 is being delivered as two chained PRs because the task forecast exceeded the 400 changed-line review budget.

- PR 1: `Button`, `StatusBadge`, `PageSection`, component exports, and focused tests.
- PR 2: `ModuleCard`, minimal `MetricCard`, moderate `App.tsx` integration, verify/archive.

PR 1 should reference issue #22 without closing it. PR 2 should close issue #22 after the remaining acceptance criteria are implemented and verified.

## PR 1 Scope Implemented

- Added `src/shared/components/atoms/Button.tsx`.
- Added `src/shared/components/atoms/StatusBadge.tsx`.
- Added `src/shared/components/organisms/PageSection.tsx`.
- Added shared component barrel exports.
- Added focused React Testing Library tests for the three core primitives.

## Strict TDD Evidence

### RED

- Added failing tests for `Button`, `StatusBadge`, and `PageSection` before implementation.
- `npm run test:run` failed because the component modules did not exist yet.
- An attempted `npm run test:run -- --runInBand` failed because Vitest does not support Jest's `--runInBand` option; the correct project command is `npm run test:run`.

### GREEN

- Implemented the three core primitives and exports.
- `npm run test:run` initially found one Button test isolation issue.
- Added explicit Testing Library cleanup to new component tests.
- `npm run test:run` passed: 6 files, 31 tests.

### TRIANGULATE

- PR 1 intentionally does not refactor `App.tsx`; that remains for PR 2 with `ModuleCard` and `MetricCard` to keep the first review slice focused.
- Existing i18n app tests continue to pass unchanged.

### REFACTOR

- Kept primitives prop-driven and generic.
- Used Tailwind utilities and existing CSS variables.
- Kept `Button` native-only; no routing/link behavior.
- Kept `StatusBadge` tone-based; no domain status mapping.
- Kept `PageSection` as a section scaffold; no app layout, routing, auth, or navigation behavior.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm run test:run` | ✅ | 6 files passed, 31 tests passed |
| `npm run lint` | ✅ | ESLint passed |
| `npm run build` | ✅ | TypeScript and Vite production build passed |

## Remaining for PR 2

- Add `ModuleCard` and tests.
- Add minimal display-only `MetricCard` and tests.
- Refactor `src/app/App.tsx` to use `PageSection` and `ModuleCard` moderately while preserving i18n behavior.
- Run final verify and archive for `add-shared-ui-primitives`.

## Risks

- PR 2 must preserve the same architecture boundaries: no backend calls, feature imports, domain status maps, routing/protected-layout behavior, external UI libraries, or hardcoded user-facing shell copy.
