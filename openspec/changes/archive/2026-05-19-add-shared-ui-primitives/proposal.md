# Proposal — add-shared-ui-primitives

## Status

proposed

## Issue

GitHub issue: #22 — `feat(foundation-ui): add reusable shared UI primitives`

## Problem Statement

InnHub has Tailwind CSS configured and an i18n foundation in place, but the current React shell still repeats layout, card, and typography styling directly in `App.tsx`. Upcoming feature modules need reusable UI building blocks before routing, page layout, and business screens expand. Without a small shared UI foundation, future modules are likely to duplicate action buttons, status indicators, cards, metric summaries, and page-section scaffolding, increasing review cost and risking inconsistent accessibility and visual behavior.

## Intent

Create the first generic shared UI primitives under `src/shared/components` using the existing architecture strategy and current Tailwind/token setup. The change should establish small, stable component APIs that future feature modules can reuse without coupling shared UI to domain rules, routing, backend services, or feature-specific state.

This is intentionally a foundation step, not a full design system.

## Scope

### In Scope

- Add generic shared UI primitives under `src/shared/components` using the existing Atomic Design direction:
  - `Button`
  - `StatusBadge`
  - `ModuleCard`
  - minimal `MetricCard`, unless the later task forecast shows it must be explicitly deferred to protect review size
  - `PageSection`
- Prefer `PageSection` over `AppLayout` for this issue to avoid pre-deciding routing, navigation, or protected layout concerns that belong to later work.
- Add focused tests for component behavior and rendering.
- Refactor `App.tsx` moderately to use `PageSection` and `ModuleCard` as usage evidence while preserving existing i18n behavior.
- Keep visible shell copy sourced from i18n resources rather than hardcoded JSX strings.
- Use existing Tailwind CSS v4 configuration and existing CSS variables/tokens.
- Maintain strict TDD evidence in later phases according to `openspec/config.yaml`.

### Out of Scope

- Domain workflows or feature-specific business screens.
- Backend, InsForge, database, or data-service calls.
- Routing, protected layout, navigation shells, or auth integration.
- Full design system work, Storybook, new UI libraries, icon packages, modals, tables, form systems, or complex polymorphic component APIs.
- Domain-specific status mappings such as room state or reservation state logic inside shared components.
- New localization infrastructure; components should receive translated React content through props/children.

## Affected Areas

- `src/shared/components/` — new reusable components and exports.
- `src/shared/components/**/__tests__/` — focused component tests.
- `src/app/App.tsx` — moderate refactor to consume `PageSection` and `ModuleCard` without changing product behavior.
- Existing i18n resources and tests — should remain compatible; no new app copy is expected unless the refactor requires it.
- `openspec/changes/add-shared-ui-primitives/` — SDD artifacts for proposal, spec, design, tasks, apply, verify, and eventual archive.

## Constraints and Architecture Rules

- Shared UI must remain generic and must not leak domain-specific behavior.
- Components must not call backend/InsForge services or feature services.
- Feature-specific components remain inside feature folders.
- Business rules should stay outside JSX and outside shared UI primitives unless they are truly domain-neutral utilities.
- Component props that accept rendered content should explicitly type `children?: React.ReactNode` or equivalent React node slots, consistent with React TypeScript guidance checked through Context7.
- Context7 is not a progress store; progress persistence for this SDD is OpenSpec plus Engram when tools are available.

## Proposed Component Direction

| Component     | Proposed role                                             | Notes                                                                                                                |
| ------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Button`      | Generic action primitive                                  | Variants and sizes should remain minimal; no routing/link abstraction in this issue.                                 |
| `StatusBadge` | Generic status/tone indicator                             | Accepts display content and visual tone; does not encode room/reservation/invoice statuses.                          |
| `ModuleCard`  | Generic card for module summaries/navigation placeholders | Receives title/description/action/icon slots from callers.                                                           |
| `MetricCard`  | Minimal generic metric display                            | Implement only if task forecast stays within review budget; otherwise explicitly defer in design/tasks and PR notes. |
| `PageSection` | Generic section scaffold                                  | Preferred over `AppLayout` to avoid scope creep into routing/protected layout.                                       |

## Success Criteria

- `Button`, `StatusBadge`, `ModuleCard`, and `PageSection` exist as generic shared UI primitives.
- `MetricCard` exists with a minimal generic API, unless a later review forecast explicitly defers it with rationale.
- Components are placed under `src/shared/components` and exported in a predictable way.
- Components do not import feature modules, route constants, backend services, InsForge clients, or domain-specific state maps.
- Components do not embed user-facing app copy; labels/titles/actions are provided by callers as React content.
- `App.tsx` uses `PageSection` and `ModuleCard` moderately as usage evidence while preserving current English/Spanish rendering.
- Tests cover core rendering/accessibility behavior for the new primitives without brittle full-class assertions.
- Existing i18n tests still pass.
- `npm run test:run`, `npm run lint`, and `npm run build` pass in verify.
- Review workload forecast remains within the 400 changed-line budget or pauses before apply with a split/defer recommendation.

## Risks

| Risk                                      | Impact                                                            | Mitigation                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Scope creep into a design system          | Large diff and premature API decisions                            | Keep APIs minimal; no Storybook, external UI library, modal/table/form systems, or polymorphic abstractions. |
| Domain leakage into shared UI             | Reusable components become coupled to MVP modules                 | Accept generic labels/tones/content only; leave status-to-tone mapping to future feature code.               |
| Premature layout decisions                | `AppLayout` could conflict with routing/protected layout issue #3 | Implement `PageSection` only for this change.                                                                |
| Review budget overrun                     | PR becomes hard to review                                         | Use auto-forecast in tasks; keep `MetricCard` minimal or explicitly defer if needed.                         |
| i18n regression during `App.tsx` refactor | Current bilingual shell behavior could break                      | Preserve existing translation keys and keep app i18n tests passing.                                          |

## Rollback Plan

If the change causes regressions or review scope becomes too large:

1. Revert the shared component additions and `App.tsx` refactor as one focused commit before PR merge, or revert the PR after merge if already promoted.
2. Keep OpenSpec artifacts documenting the rejected/deferred decisions when useful, or archive the abandoned change with a failed/withdrawn status.
3. Re-open a smaller follow-up that implements only `Button`, `StatusBadge`, and `PageSection`, deferring card primitives to dashboard/module work.
4. No database or backend rollback is required because this change must not touch data persistence or services.

## Review Forecast

Initial forecast: medium. The code scope is small, but tests plus OpenSpec artifacts can increase changed lines. To protect the 400 changed-line budget, the design/tasks phases should keep component APIs compact, avoid broad `App.tsx` rewrites, and decide whether minimal `MetricCard` fits before apply.

## Dependencies

- #2 starter shell replacement: complete.
- #23 Tailwind foundation: complete.
- #26 i18n foundation: complete.

## Skill Resolution

none — no parent-injected skill paths were available in this delegated runtime; work used the assigned SDD proposal role instructions plus project files (`AGENTS.md`, `docs/05-architecture.md`, and `openspec/config.yaml`).

## Memory Persistence

Engram persistence was requested for this SDD flow, but this delegated runtime does not expose Engram memory tools. The proposal has been persisted to OpenSpec artifacts; the parent session should save `sdd/add-shared-ui-primitives/proposal` to Engram if available.
