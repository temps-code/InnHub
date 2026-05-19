# Design — add-shared-ui-primitives

## Status

Designed

## Context

Issue #22 establishes InnHub's first reusable shared UI primitives after the Tailwind foundation (#23) and i18n foundation (#26). The current app shell in `src/app/App.tsx` still owns layout/card styling directly. Future modules need generic primitives before routing/layout and feature screens expand.

This design follows:

- `AGENTS.md` architecture boundaries: shared UI remains generic, backend-free, and domain-neutral.
- `docs/05-architecture.md` Atomic Design guidance and reusable component candidate list.
- `openspec/changes/add-shared-ui-primitives/specs/shared-ui/spec.md` requirements.
- `openspec/config.yaml` strict TDD and quality command rules.

## Goals

- Add small, stable shared component APIs under `src/shared/components`.
- Keep all components presentation-only and caller-driven.
- Reuse existing Tailwind v4 setup and CSS variables from `src/index.css`.
- Refactor `App.tsx` just enough to prove `PageSection` and `ModuleCard` usage while preserving i18n behavior.
- Keep implementation reviewable under the 400 changed-line budget where possible.

## Non-Goals

- No backend, InsForge, database, services, hooks, or data access work.
- No route constants, router links, protected layout, auth shell, sidebar, or navigation decisions.
- No Storybook, icon package, external UI library, modal/table/form system, or polymorphic `asChild` framework.
- No domain status mapping inside shared components.
- No new localization infrastructure or hardcoded app copy in shared components.

## Folder and Export Design

```text
src/shared/components/
├── atoms/
│   ├── Button.tsx
│   ├── StatusBadge.tsx
│   ├── __tests__/
│   │   ├── Button.test.tsx
│   │   └── StatusBadge.test.tsx
│   └── index.ts
├── molecules/
│   ├── ModuleCard.tsx
│   ├── MetricCard.tsx
│   ├── __tests__/
│   │   ├── ModuleCard.test.tsx
│   │   └── MetricCard.test.tsx
│   └── index.ts
├── organisms/
│   ├── PageSection.tsx
│   ├── __tests__/
│   │   └── PageSection.test.tsx
│   └── index.ts
└── index.ts
```

Export convention:

- Each component file exports its component and prop/type aliases needed by consumers.
- Folder `index.ts` files re-export component modules.
- `src/shared/components/index.ts` re-exports from `atoms`, `molecules`, and `organisms`.
- Avoid exporting non-component constants from component files if ESLint/React Refresh complains; if needed, keep internal maps non-exported or move exported types only.

## Component Contracts

### `Button`

Path: `src/shared/components/atoms/Button.tsx`

```ts
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
};
```

Behavior:

- Renders a native `<button>`.
- Preserves all standard button attributes and event handlers.
- Defaults `type` to `button` unless caller provides a type, preventing accidental form submits.
- Treats `disabled || isLoading` as unavailable and passes `disabled` to the native button.
- Exposes `aria-busy={true}` when loading.
- Renders caller-provided children unchanged.
- Does not include routing/link behavior.

Styling:

- Base: inline-flex, centered content, rounded shape, font weight, focus-visible ring, disabled cursor/opacity.
- Variants use existing CSS variables where possible:
  - `primary`: `--color-primary` background with white/dark-compatible text.
  - `secondary`: surface/background border style.
  - `ghost`: transparent low-emphasis action.
  - `danger`: semantic red palette from Tailwind utilities, not a new design token.
- Sizes map to compact padding/text classes.
- `fullWidth` adds `w-full`.

Accessibility:

- Native button semantics provide role and keyboard handling.
- Loading state disables activation and marks busy.
- Caller remains responsible for accessible text or `aria-label` when icon-only content is used.

### `StatusBadge`

Path: `src/shared/components/atoms/StatusBadge.tsx`

```ts
export type StatusBadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";
export type StatusBadgeSize = "sm" | "md";

export type StatusBadgeProps = {
  label: React.ReactNode;
  tone?: StatusBadgeTone;
  size?: StatusBadgeSize;
  className?: string;
};
```

Behavior:

- Renders caller-provided `label` inside a non-interactive inline element, preferably `<span>`.
- Does not derive labels, tones, or meanings from domain statuses.
- Does not import reservation/room/invoice/maintenance state maps.

Styling:

- Small rounded badge with border/background/text classes.
- Tone classes are generic visual tones only.
- Use CSS variables for neutral/accent alignment and Tailwind semantic palettes for success/warning/danger/info.

Accessibility:

- As text content, badge should be discoverable by normal text queries.
- No ARIA role is needed by default; callers can wrap or label context if a domain screen requires more semantics.

### `ModuleCard`

Path: `src/shared/components/molecules/ModuleCard.tsx`

```ts
export type ModuleCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};
```

Behavior:

- Renders a generic card, preferably as `<article>`.
- Requires `title`; all other slots are optional.
- Does not require navigation or route props.
- Caller supplies any action element, including a future `Button` or router link wrapper outside this primitive.
- Does not know module names or feature availability.

Styling:

- Rounded panel using existing `--color-border`, `--color-background`/`--color-surface`, and `--color-heading`/`--color-muted` tokens.
- Supports optional icon slot in a consistent visual container.
- Keeps spacing compact enough for current shell module list.

Accessibility:

- Title should render as a heading-like element or visible text. Because heading level depends on page context, use a neutral element with strong styling by default unless the caller passes heading content.
- Do not auto-generate IDs unless needed. Current app can use surrounding `ul`/`li` semantics for module list accessibility.

### `MetricCard`

Path: `src/shared/components/molecules/MetricCard.tsx`

```ts
export type MetricCardTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type MetricCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  helperText?: React.ReactNode;
  trend?: React.ReactNode;
  tone?: MetricCardTone;
  className?: string;
};
```

Behavior:

- Renders a display-only metric summary.
- Does not calculate values, percentages, occupancy, revenue, or alerts.
- Does not import report/dashboard models or services.
- Caller supplies formatted `label`, `value`, helper, and trend content.

Styling:

- Card shell similar to `ModuleCard`, but optimized for label/value hierarchy.
- Tone only changes a small accent style, not semantic business meaning.

Accessibility:

- Label and value are plain readable content.
- Optional trend/helper are text/React nodes supplied by caller.
- No live region by default; future dashboard modules can decide if realtime metrics need ARIA live behavior.

### `PageSection`

Path: `src/shared/components/organisms/PageSection.tsx`

```ts
export type PageSectionVariant = "plain" | "panel" | "hero";

export type PageSectionProps = {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleId?: string;
  variant?: PageSectionVariant;
};
```

Behavior:

- Renders a reusable `<section>` scaffold.
- Supports optional eyebrow, title, description, actions, and children.
- If `titleId` is provided and `title` exists, applies it to the title and `aria-labelledby` to the section.
- Does not introduce global app layout, route protection, navigation, or auth shell behavior.

Styling:

- `plain`: spacing-only section.
- `panel`: bordered rounded panel using `--color-surface`, `--color-border`, and `--shadow-panel`.
- `hero`: large heading/intro spacing compatible with the current top app shell.
- Responsive layout remains local and minimal; avoid broad page grid decisions.

Accessibility:

- Section landmarks are labelled when a title/titleId is supplied.
- Actions slot is visually grouped with header content.
- Heading level is fixed to a sensible default only if the component renders the title itself. For current app usage, `PageSection` can render hero title as `h1` only if an optional `titleAs` is added; to keep API small, prefer `title` rendered as `h2` by default and allow current hero to keep custom `h1` outside if necessary.

Implementation note: If preserving the current `h1#app-title` through `PageSection` would require a complex polymorphic heading API, keep hero markup explicit in `App.tsx` and use `PageSection` for foundation panel. However, the preferred moderate integration is to support a small `titleLevel?: 1 | 2 | 3` prop if needed:

```ts
titleLevel?: 1 | 2 | 3;
```

This is acceptable because it is layout/accessibility scaffolding, not polymorphic component scope creep.

## App Integration Design

Target file: `src/app/App.tsx`

Integration scope:

- Keep `foundationModuleKeys` and `useTranslation()` behavior.
- Preserve `main` container, `aria-labelledby="app-title"`, app icon, and existing translation keys.
- Use `PageSection` for the hero section and foundation panel if it can preserve the current `h1`/`h2` accessibility with the small `titleLevel` option.
- Use `ModuleCard` inside each list item for module labels.
- Do not add new user-facing strings. Existing module labels continue to resolve from `t("modules.items.*")`.
- Do not add routing/actions to module cards.

Expected composition shape:

```tsx
<PageSection
  variant="hero"
  title={t("hero.title")}
  titleId="app-title"
  titleLevel={1}
  eyebrow={t("hero.eyebrow")}
  description={t("hero.description")}
>
  <img ... />
</PageSection>

<PageSection
  variant="panel"
  title={t("foundation.title")}
  titleId="foundation-title"
  eyebrow={t("foundation.eyebrow")}
  description={t("foundation.description")}
>
  <ul aria-label={t("modules.ariaLabel")}>
    {foundationModuleKeys.map((moduleKey) => (
      <li key={moduleKey}>
        <ModuleCard title={t(`modules.items.${moduleKey}`)} />
      </li>
    ))}
  </ul>
</PageSection>
```

If the implementation shows that `PageSection` becomes too specialized for the hero image placement, limit `PageSection` usage to the foundation panel and document that decision in apply/verify. The spec requires moderate usage evidence, not a full shell rewrite.

## Styling Approach

- Use Tailwind utility classes directly in components.
- Reuse current CSS custom properties from `src/index.css`:
  - `--color-background`
  - `--color-surface`
  - `--color-heading`
  - `--color-text`
  - `--color-muted`
  - `--color-primary`
  - `--color-primary-soft`
  - `--color-border`
  - `--shadow-panel`
- Do not add new global CSS tokens unless implementation uncovers a strong need; this design expects none.
- Use Tailwind semantic palettes only for generic tones (`red`, `amber`, `emerald`, `sky`) where existing InnHub tokens are not specific enough.
- Avoid class assertions in tests except minimal smoke checks for variants if necessary.

## Accessibility Approach

- Prefer native semantic elements (`button`, `section`, `article`, `span`).
- Preserve accessible names from caller-provided content.
- Avoid ARIA where native semantics are enough.
- Use `aria-busy` and `disabled` for `Button` loading.
- Use `aria-labelledby` for `PageSection` when `titleId` is provided.
- Keep `App.tsx` `main` labelled by `app-title`.
- Do not hide visible content from assistive tech unless purely decorative (current app icon remains `alt="" aria-hidden="true"`).

## Data and Dependency Flow

```text
App.tsx
  ├─ react-i18next `t(...)` supplies localized React text
  └─ shared components receive localized props/children
       ├─ render presentation only
       ├─ no i18n imports
       ├─ no backend/service imports
       └─ no feature/domain imports
```

Shared components are leaf presentation modules. Future feature modules will map domain state to generic props before calling these components.

## Tests

Test framework: Vitest + React Testing Library via `npm run test:run`.

Add focused component tests:

- `Button.test.tsx`
  - renders accessible button by name;
  - calls `onClick` when enabled;
  - does not call `onClick` when disabled/loading;
  - exposes busy state for `isLoading`.
- `StatusBadge.test.tsx`
  - renders arbitrary label;
  - renders generic tones without domain assumptions;
  - does not require domain status values.
- `ModuleCard.test.tsx`
  - renders title;
  - renders optional description, eyebrow, icon, and action slots.
- `MetricCard.test.tsx`
  - renders label and value;
  - renders helper/trend slots;
  - accepts generic tone without calculating metrics.
- `PageSection.test.tsx`
  - renders title, eyebrow, description, actions, and children;
  - labels section when `titleId` is supplied;
  - supports `panel` or `hero` variant smoke render without brittle full-class assertions.

Regression tests:

- Existing `src/app/__tests__/App.i18n.test.tsx` must continue passing.
- If the App refactor changes DOM structure enough to require query updates, keep assertions behavioral: localized English/Spanish text and module labels still render.

Quality gates:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Review Budget Forecast

Implementation-only forecast excluding OpenSpec artifacts:

| Area                             | Estimated changed lines |
| -------------------------------- | ----------------------: |
| Component source files + exports |                 180-230 |
| Component tests                  |                 180-240 |
| `App.tsx` integration            |                   35-70 |
| Existing app test adjustments    |                    0-30 |
| Total implementation forecast    |                 395-570 |

Risk: implementing all five components with tests may exceed the 400 changed-line review budget.

Mitigation for tasks/apply:

1. Keep component APIs exactly as designed; no extra variants/systems.
2. Keep tests compact and behavior-oriented.
3. Use minimal `MetricCard`; do not defer initially because the user approved implementing it, but pause before apply if task-level estimates show a large overrun.
4. Keep `App.tsx` refactor moderate; no full shell redesign.
5. If implementation forecast remains over budget after tasks, ask for a split/defer decision before apply.

OpenSpec artifacts themselves add lines but are review/support artifacts. PR notes should distinguish implementation scope from SDD artifact size.

## Tradeoff Decisions

### PageSection vs AppLayout

Decision: implement `PageSection`, not `AppLayout`.

Rationale:

- `PageSection` satisfies current issue acceptance while avoiding routing, navigation, auth, and protected-layout decisions.
- `AppLayout` belongs naturally with issue #3 (`define routing and protected layout structure`).
- `PageSection` is reusable immediately for current shell and future feature pages.

Consequence:

- Future routing/layout work can compose `PageSection` inside `AppLayout` later without undoing this change.

### Minimal MetricCard vs Deferral

Decision: implement minimal `MetricCard` now.

Rationale:

- User approved the recommendation to implement it minimally.
- Issue #22 acceptance allows deferral, but docs identify `MetricCard` as a reusable candidate for dashboard/report work.
- A display-only `MetricCard` can be generic without dashboard calculations.

Consequence:

- Must not add charting, calculations, report models, trend parsing, or live metric behavior.
- If review-budget forecast becomes too high before apply, pause for explicit split/defer approval.

### App.tsx Refactor Scope

Decision: moderate refactor using `PageSection` and `ModuleCard` only.

Rationale:

- Provides real usage evidence for shared primitives.
- Avoids rewriting the app shell or adding feature behavior.
- Preserves existing i18n resources and tests.

Consequence:

- `Button`, `StatusBadge`, and `MetricCard` may be introduced with tests but not necessarily used in `App.tsx` yet.
- No new app copy or navigation behavior is introduced.

### Class Composition Helper

Decision: avoid adding a `cn`/class utility unless necessary.

Rationale:

- A helper could reduce class string complexity, but it adds another shared utility decision and tests.
- Small components can compose `className` with arrays/filter/join locally.

Consequence:

- If repeated class composition becomes noisy during apply, a tiny local helper inside each component is acceptable; do not introduce a broad utility without documenting it.

## Rollout Plan

1. Tasks phase creates strict TDD checklist and confirms review-budget forecast.
2. Apply phase implements tests first per component, then minimal source to pass.
3. Refactor `App.tsx` after primitives exist and tests cover them.
4. Run `npm run test:run`, `npm run lint`, and `npm run build`.
5. Verify phase checks architecture boundaries and SDD acceptance.
6. Archive phase syncs canonical `shared-ui` spec if verification passes.
7. PR from `features` to `qa` for issue #22 after user approval.

## Open Questions

None blocking. User has approved automatic continuation, minimal MetricCard, and moderate `App.tsx` usage. The only pause condition is review-budget overrun or unexpected architecture risk before apply.
