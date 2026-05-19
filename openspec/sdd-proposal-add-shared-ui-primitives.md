# SDD Proposal — add-shared-ui-primitives

## Status

pass

## Executive Summary

Created the proposal for InnHub change `add-shared-ui-primitives` / GitHub issue #22. The proposal defines a minimal shared UI foundation using existing Tailwind and i18n foundations, prefers `PageSection` over `AppLayout`, plans a minimal `MetricCard` unless review forecasting requires deferral, and scopes a moderate `App.tsx` refactor to use `PageSection` and `ModuleCard` as usage evidence.

## Artifact

- Proposal: `openspec/changes/add-shared-ui-primitives/proposal.md`

## Scope Summary

### In Scope

- Generic shared UI primitives under `src/shared/components`:
  - `Button`
  - `StatusBadge`
  - `ModuleCard`
  - minimal `MetricCard`, unless explicitly deferred by review forecast
  - `PageSection`
- Focused tests for rendering/accessibility behavior.
- Moderate `App.tsx` refactor using `PageSection` + `ModuleCard` while preserving i18n behavior.
- Strict TDD in later phases.

### Out of Scope

- Domain workflows, backend calls, routing/protected layout, full design system, new UI libraries, Storybook, modals, tables, forms, or domain-specific status maps.

## Key Decisions Captured

- Use minimal SDD for #22 because it defines shared component contracts.
- Prefer `PageSection` over `AppLayout` to avoid scope creep into issue #3 routing/protected layout.
- Implement `MetricCard` minimally unless the tasks/design forecast shows it should be deferred to protect the 400 changed-line review budget.
- Keep components generic, prop-driven, and free of feature/backend imports.
- Use existing Tailwind CSS variables and existing i18n resources; do not hardcode new user-facing shell copy in JSX.
- Context7 React guidance was incorporated: TypeScript component props should explicitly type React node slots such as `children?: React.ReactNode`; Context7 is not a progress store.

## Files Read

- `AGENTS.md`
- `docs/05-architecture.md`
- `openspec/config.yaml`
- `src/app/App.tsx`
- `src/index.css`
- `package.json`
- `src/shared/i18n/*` overview via grep

## Validation

- Proposal artifact written successfully.
- No code implementation was performed in this proposal phase.
- No tests were run because this phase only writes planning artifacts.

## Review Forecast

Initial forecast: medium. Component code should be small, but tests and SDD artifacts can push changed lines upward. The design/tasks phases should keep APIs compact and pause before apply if the implementation forecast exceeds 400 changed lines.

## Skill Resolution

none — no parent-injected skill paths were available in this delegated runtime; work used the assigned SDD proposal role instructions plus project files.

## Memory

Engram persistence was requested, but this delegated runtime does not expose Engram memory tools. The proposal file includes a memory persistence note for the parent session to save `sdd/add-shared-ui-primitives/proposal` if Engram is available.
