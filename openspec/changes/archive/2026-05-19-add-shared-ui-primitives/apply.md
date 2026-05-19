# SDD Apply — add-shared-ui-primitives

## Status

pass

## Delivery Strategy

Issue #22 was delivered as two chained PRs because the task forecast exceeded the 400 changed-line review budget.

- PR 1: `Button`, `StatusBadge`, `PageSection`, component exports, and focused tests.
- PR 2: `ModuleCard`, minimal `MetricCard`, moderate `App.tsx` integration, verify/archive.

PR 1 references issue #22 without closing it. PR 2 closes issue #22 after the remaining acceptance criteria are implemented and verified.

## Scope Implemented

### PR 1

- Added `src/shared/components/atoms/Button.tsx`.
- Added `src/shared/components/atoms/StatusBadge.tsx`.
- Added `src/shared/components/organisms/PageSection.tsx`.
- Added shared component barrel exports for atoms and organisms.
- Added focused React Testing Library tests for the three core primitives.

### PR 2

- Added `src/shared/components/molecules/ModuleCard.tsx`.
- Added `src/shared/components/molecules/MetricCard.tsx`.
- Added molecule barrel exports and root shared component exports.
- Added focused React Testing Library tests for both card primitives.
- Refactored `src/app/App.tsx` to use `PageSection` and `ModuleCard` while preserving i18n-backed shell content.

## Strict TDD Evidence

### RED

- PR 1: Added failing tests for `Button`, `StatusBadge`, and `PageSection` before implementation.
- PR 1: `npm run test:run` failed because the component modules did not exist yet.
- PR 2: Added failing tests for `ModuleCard` and `MetricCard` before implementation.
- PR 2: `npm run test:run` failed because `ModuleCard` and `MetricCard` modules did not exist yet.
- Note: An attempted `npm run test:run -- --runInBand` failed because Vitest does not support Jest's `--runInBand` option; the correct project command is `npm run test:run`.

### GREEN

- PR 1: Implemented the three core primitives and exports.
- PR 1: `npm run test:run` initially found one Button test isolation issue; added explicit Testing Library cleanup to new component tests.
- PR 1: `npm run test:run` passed: 6 files, 31 tests.
- PR 2: Implemented `ModuleCard`, `MetricCard`, and molecule exports.
- PR 2: `npm run test:run` passed: 8 files, 36 tests.

### TRIANGULATE

- PR 1 intentionally did not refactor `App.tsx`; that remained for PR 2 to keep the first review slice focused.
- PR 2 refactored `App.tsx` to use `PageSection` for the foundation section and `ModuleCard` for module labels.
- Existing i18n app tests continued to pass unchanged after the app composition refactor.

### REFACTOR

- Kept primitives prop-driven and generic.
- Used Tailwind utilities and existing CSS variables.
- Kept `Button` native-only; no routing/link behavior.
- Kept `StatusBadge` tone-based; no domain status mapping.
- Kept `PageSection` as a section scaffold; no app layout, routing, auth, or navigation behavior.
- Kept `ModuleCard` slot-based; no route constants or module metadata.
- Kept `MetricCard` display-only; no metric calculations, dashboard logic, or service imports.

## Validation

| Command            | Result | Notes                                       |
| ------------------ | ------ | ------------------------------------------- |
| `npm run test:run` | ✅     | 8 files passed, 36 tests passed             |
| `npm run lint`     | ✅     | ESLint passed                               |
| `npm run build`    | ✅     | TypeScript and Vite production build passed |

## Risks

- None blocking after split delivery. PR 2 must still receive fresh review before commit/PR.
