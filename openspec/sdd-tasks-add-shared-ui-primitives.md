# SDD Tasks — add-shared-ui-primitives

## Status

completed — chained PR delivery implemented

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 430-620 implementation lines, plus OpenSpec artifacts |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Button + StatusBadge + PageSection + exports → PR 2: ModuleCard + MetricCard + App.tsx integration |
| Delivery strategy | chained PRs |
| Chain strategy | PR 1 core primitives, PR 2 card primitives and App shell usage |

Decision needed before apply: Resolved — user approved two PRs for the same issue.
Chained PRs recommended: Yes
Chain strategy: PR 1 uses `Refs #22`; PR 2 uses `Closes #22`.
400-line budget risk: High

## Forecast Notes

The design-approved scope includes five shared primitives, five focused test files, barrel exports, and a moderate `src/app/App.tsx` refactor. Even with compact implementation, this is likely to exceed the 400 changed-line review budget. Apply should pause for an explicit delivery decision before code changes:

- **Option A — chained PRs recommended:** split into two autonomous PRs as forecast above.
- **Option B — size exception:** implement all issue #22 acceptance in one PR and document the >400-line exception.
- **Option C — scope trim:** defer `MetricCard` despite prior approval, then implement it with dashboard/report work.

## Task Plan

### 0. Pre-apply delivery decision gate

- [x] Confirm delivery path before implementation because the 400-line risk is High.
  - Start: before editing source files.
  - Finish: selected path recorded in apply artifact / PR notes.
  - Verification: `tasks.md` guard lines remain visible and selected strategy is explicit.
  - Rollback: no code changes yet.

### 1. RED — shared component test skeletons

- [x] Add failing tests for `Button` in `src/shared/components/atoms/__tests__/Button.test.tsx`.
  - Cover accessible button name, enabled click behavior, disabled click prevention, loading click prevention, and `aria-busy` for loading.
  - Verification: `npm run test:run` fails because `src/shared/components/atoms/Button.tsx` does not exist yet or behavior is missing.
  - Rollback: remove the new Button test file.

- [x] Add failing tests for `StatusBadge` in `src/shared/components/atoms/__tests__/StatusBadge.test.tsx`.
  - Cover arbitrary label rendering and generic tone smoke behavior without room/reservation/invoice terms.
  - Verification: `npm run test:run` fails for missing/unfinished `StatusBadge`.
  - Rollback: remove the new StatusBadge test file.

- [x] Add failing tests for `PageSection` in `src/shared/components/organisms/__tests__/PageSection.test.tsx`.
  - Cover title, eyebrow, description, actions, children, `titleId` labelled section behavior, and a `variant` smoke render.
  - Verification: `npm run test:run` fails for missing/unfinished `PageSection`.
  - Rollback: remove the new PageSection test file.

- [x] Add failing tests for `ModuleCard` in `src/shared/components/molecules/__tests__/ModuleCard.test.tsx`.
  - Cover title plus optional description, eyebrow, icon, and action slots.
  - Verification: `npm run test:run` fails for missing/unfinished `ModuleCard`.
  - Rollback: remove the new ModuleCard test file.

- [x] Add failing tests for minimal `MetricCard` in `src/shared/components/molecules/__tests__/MetricCard.test.tsx` if the selected delivery path includes it in this PR.
  - Cover label, value, helper text, trend slot, and generic tone without calculations.
  - Verification: `npm run test:run` fails for missing/unfinished `MetricCard`.
  - Rollback: remove the new MetricCard test file or mark MetricCard as explicitly deferred in apply/PR notes.

### 2. GREEN — implement primitives and exports

- [x] Implement `src/shared/components/atoms/Button.tsx`.
  - Keep a native `<button>`, default `type="button"`, standard button attributes, `variant`, `size`, `isLoading`, `fullWidth`, disabled/loading unavailability, and `aria-busy`.
  - Do not add routing/link behavior.
  - Verification: Button tests pass.
  - Rollback: remove `Button.tsx` and its exports.

- [x] Implement `src/shared/components/atoms/StatusBadge.tsx`.
  - Use caller-provided `label`, generic `tone`, generic `size`, optional `className`, and no domain mappings.
  - Verification: StatusBadge tests pass.
  - Rollback: remove `StatusBadge.tsx` and its exports.

- [x] Implement `src/shared/components/organisms/PageSection.tsx`.
  - Support `title`, `eyebrow`, `description`, `actions`, `children`, `className`, `titleId`, `variant`, and `titleLevel?: 1 | 2 | 3` only if needed for `App.tsx` accessibility.
  - Use `aria-labelledby` only when `titleId` and `title` are supplied.
  - Do not introduce navigation, routing, protected layout, auth shell, or sidebar behavior.
  - Verification: PageSection tests pass.
  - Rollback: remove `PageSection.tsx` and its exports.

- [x] Implement `src/shared/components/molecules/ModuleCard.tsx`.
  - Render a generic card with `title`, optional `description`, `eyebrow`, `action`, `icon`, and `className`.
  - Do not import route constants, feature modules, or module metadata.
  - Verification: ModuleCard tests pass.
  - Rollback: remove `ModuleCard.tsx` and its exports.

- [x] Implement `src/shared/components/molecules/MetricCard.tsx` if not deferred by the delivery decision.
  - Render display-only `label`, `value`, optional `helperText`, `trend`, `tone`, and `className`.
  - Do not calculate occupancy, revenue, trends, alerts, or import dashboard/report services.
  - Verification: MetricCard tests pass.
  - Rollback: remove `MetricCard.tsx` and its exports, or document explicit deferral.

- [x] Add predictable exports.
  - Paths: `src/shared/components/atoms/index.ts`, `src/shared/components/molecules/index.ts`, `src/shared/components/organisms/index.ts`, `src/shared/components/index.ts`.
  - Verification: tests/imports compile; no `react-refresh/only-export-components` warning from exported constants.
  - Rollback: remove or adjust barrel exports.

### 3. TRIANGULATE — integrate with current app shell

- [x] Refactor `src/app/App.tsx` to use `PageSection` and `ModuleCard` moderately.
  - Preserve `useTranslation()`, `foundationModuleKeys`, `main aria-labelledby="app-title"`, existing translation keys, app icon behavior, and module list `aria-label`.
  - Do not add new user-facing shell copy; continue using `t(...)` for current copy.
  - Do not introduce routes, backend data, feature screens, or module availability logic.
  - Verification: existing `src/app/__tests__/App.i18n.test.tsx` passes without weakening localized behavior assertions.
  - Rollback: revert only the `App.tsx` composition changes while keeping shared primitives if their tests pass.

- [x] Adjust `src/app/__tests__/App.i18n.test.tsx` only if the DOM structure changes while preserving behavior.
  - Keep assertions focused on English/Spanish rendering, persisted Spanish locale, invalid locale fallback, and module labels.
  - Verification: app i18n tests pass.
  - Rollback: restore previous tests if no DOM query update is needed.

### 4. REFACTOR — compactness and architecture boundary cleanup

- [x] Review component files for scope creep.
  - Concrete targets: `src/shared/components/**/*.tsx`.
  - Ensure no imports from `src/features`, `src/shared/services`, backend/InsForge clients, route constants, i18n resources, or domain status maps.
  - Verification: manual import scan plus lint/build.
  - Rollback: remove offending dependency or move mapping to caller/feature code.

- [x] Keep styling compact and token-aligned.
  - Concrete targets: `Button.tsx`, `StatusBadge.tsx`, `ModuleCard.tsx`, `MetricCard.tsx`, `PageSection.tsx`.
  - Use Tailwind utilities and existing CSS variables from `src/index.css`; do not add global tokens unless separately justified.
  - Verification: no edits expected in `src/index.css` for this change.
  - Rollback: revert any unnecessary global CSS/token changes.

- [x] Keep tests behavior-oriented.
  - Concrete targets: `src/shared/components/**/__tests__/*.test.tsx`.
  - Avoid brittle assertions against complete Tailwind class strings.
  - Verification: tests still pass after minor class changes.
  - Rollback: replace brittle class checks with role/text/attribute assertions.

### 5. Verification gates

- [x] Run `npm run test:run`.
  - Expected: all shared component tests and existing app/i18n tests pass.

- [x] Run `npm run lint`.
  - Expected: ESLint passes, including React Refresh export constraints.

- [x] Run `npm run build`.
  - Expected: TypeScript and Vite production build pass.

- [x] Record RED/GREEN/TRIANGULATE/REFACTOR evidence in `openspec/changes/add-shared-ui-primitives/apply.md` during apply.

- [x] During verify, confirm the requirements in `openspec/changes/add-shared-ui-primitives/specs/shared-ui/spec.md` and write `openspec/changes/add-shared-ui-primitives/verify.md`.

## Acceptance Checklist

- [x] `Button` exists under `src/shared/components/atoms/Button.tsx` with native accessible button semantics.
- [x] `StatusBadge` exists under `src/shared/components/atoms/StatusBadge.tsx` with generic visual tones and no domain mappings.
- [x] `ModuleCard` exists under `src/shared/components/molecules/ModuleCard.tsx` with caller-provided content slots.
- [x] Minimal `MetricCard` exists under `src/shared/components/molecules/MetricCard.tsx`, or deferral is explicitly approved and documented before apply.
- [x] `PageSection` exists under `src/shared/components/organisms/PageSection.tsx`; no `AppLayout` is introduced.
- [x] Shared components are exported through predictable shared component entry points.
- [x] `src/app/App.tsx` uses `PageSection` and `ModuleCard` moderately without changing visible/i18n behavior.
- [x] No backend, InsForge, feature, routing, protected-layout, or domain status mapping dependencies are introduced in shared UI.
- [x] No external UI library, Storybook, icon package, modal/table/form system, or polymorphic component framework is introduced.
- [x] `npm run test:run` passes.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.

## Suggested Split If Approved

### PR 1 — shared-ui-core

- Files: `src/shared/components/atoms/Button.tsx`, `src/shared/components/atoms/StatusBadge.tsx`, `src/shared/components/organisms/PageSection.tsx`, related tests, and component barrel exports.
- Verification: component tests, `npm run test:run`, `npm run lint`, `npm run build`.
- Rollback boundary: revert PR 1 without touching `App.tsx` or card primitives.

### PR 2 — shared-ui-cards-and-shell-usage

- Files: `src/shared/components/molecules/ModuleCard.tsx`, `src/shared/components/molecules/MetricCard.tsx`, related tests, `src/app/App.tsx`, and any necessary app test adjustments.
- Verification: card tests, existing i18n app tests, `npm run test:run`, `npm run lint`, `npm run build`.
- Rollback boundary: revert PR 2 while keeping core shared primitives from PR 1.

## Next Recommended

Proceed with SDD verify/archive and PR 2 preparation. The chained PR strategy has been selected and implemented.

## Risks

- High review workload if all five components, tests, `App.tsx` refactor, and SDD artifacts are reviewed in one PR.
- `MetricCard` can drift into dashboard behavior if not kept display-only.
- `PageSection` can drift into `AppLayout` if routing/navigation/auth concerns are added.
- Existing i18n tests may need query adjustments after composition changes; do not weaken behavioral coverage.

## Skill Resolution

none — no parent-injected skill paths were available in this delegated runtime; work used the assigned SDD tasks role instructions plus project files.

## Memory

Engram persistence was requested, but this delegated runtime does not expose Engram memory tools. The tasks artifact has been written to the requested OpenSpec artifact path; the parent session should save `sdd/add-shared-ui-primitives/tasks` to Engram if available.
