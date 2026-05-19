# SDD Design — add-shared-ui-primitives

## Status

pass

## Executive Summary

Designed the shared UI primitive foundation for InnHub issue #22. The design keeps APIs small, generic, and presentation-only; places components under `src/shared/components` using Atomic Design folders; uses existing Tailwind v4 utilities and InnHub CSS variables; and limits `App.tsx` integration to moderate composition with `PageSection` and `ModuleCard` while preserving i18n behavior.

## Artifact

- Design document: `openspec/changes/add-shared-ui-primitives/design.md`

## Key Decisions

- Implement `PageSection`, not `AppLayout`, to avoid premature routing/auth/protected-layout decisions that belong to issue #3.
- Implement a minimal display-only `MetricCard` now, as approved, but pause before apply if task-level review forecast materially exceeds the 400 changed-line budget.
- Refactor `App.tsx` moderately to use `PageSection` and `ModuleCard`; do not redesign the shell, add routing, or introduce new user-facing copy.
- Use Tailwind utilities plus existing CSS variables from `src/index.css`; do not add a UI library, Storybook, icon package, modal/table/form system, or broad design-token expansion.
- Keep shared UI leaf-level and prop-driven: no i18n imports, backend/service imports, feature imports, route constants, or domain status maps.

## Component API Summary

| Component     | Location                                          | API summary                                                                                                                                   |
| ------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`      | `src/shared/components/atoms/Button.tsx`          | Native button with `variant`, `size`, `isLoading`, `fullWidth`, and standard button attributes.                                               |
| `StatusBadge` | `src/shared/components/atoms/StatusBadge.tsx`     | Inline label with generic `tone`, `size`, and `className`; no domain status mapping.                                                          |
| `ModuleCard`  | `src/shared/components/molecules/ModuleCard.tsx`  | Generic card with `title`, optional `description`, `eyebrow`, `action`, `icon`, and `className`.                                              |
| `MetricCard`  | `src/shared/components/molecules/MetricCard.tsx`  | Display-only metric with `label`, `value`, optional `helperText`, `trend`, `tone`, and `className`.                                           |
| `PageSection` | `src/shared/components/organisms/PageSection.tsx` | Section scaffold with `title`, `eyebrow`, `description`, `actions`, `children`, `titleId`, `variant`, optional `titleLevel`, and `className`. |

## Planned Folder Structure

```text
src/shared/components/
├── atoms/
│   ├── Button.tsx
│   ├── StatusBadge.tsx
│   ├── __tests__/
│   └── index.ts
├── molecules/
│   ├── ModuleCard.tsx
│   ├── MetricCard.tsx
│   ├── __tests__/
│   └── index.ts
├── organisms/
│   ├── PageSection.tsx
│   ├── __tests__/
│   └── index.ts
└── index.ts
```

## Test Strategy

Strict TDD should add focused React Testing Library tests for each primitive before implementation:

- `Button`: accessible name, click behavior, disabled/loading behavior, busy state.
- `StatusBadge`: arbitrary label and generic tone rendering without domain assumptions.
- `ModuleCard`: title plus optional description, eyebrow, icon, and action slots.
- `MetricCard`: label/value/helper/trend rendering with no metric calculations.
- `PageSection`: heading/description/actions/children and labelled section behavior.
- Existing `App.i18n.test.tsx` must continue passing after `App.tsx` refactor.

Quality gates remain:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Review Budget Forecast

Implementation-only forecast is approximately 395-570 changed lines before OpenSpec artifacts. This may exceed the 400-line budget if tests or component styling grow. The tasks phase should protect the budget by keeping tests/components compact and should pause before apply if the forecast remains materially above budget.

## Next Recommended

Run SDD tasks phase for `add-shared-ui-primitives` to turn this design into a strict TDD checklist, confirm the review-budget forecast, and define pause/split conditions before implementation.

## Risks

- Review workload may exceed 400 changed lines due to five components plus tests.
- `PageSection` could become too specialized if it tries to fully own hero layout. Mitigation: keep API small and allow `App.tsx` to retain explicit hero markup if needed.
- `MetricCard` could drift into dashboard logic. Mitigation: display-only props, no calculations or feature imports.

## Skill Resolution

none — no parent-injected skill paths were available in this delegated runtime; work used the assigned SDD design role instructions plus project files.

## Memory

Engram persistence was requested, but this delegated runtime does not expose Engram memory tools. The design has been persisted to OpenSpec artifacts; the parent session should save `sdd/add-shared-ui-primitives/design` to Engram if available.
