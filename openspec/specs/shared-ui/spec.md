# Shared UI Specification

## Purpose

Define InnHub's first reusable, domain-neutral shared UI primitives for the React frontend so future feature modules can reuse consistent action, status, card, metric, and page-section patterns without coupling shared components to business workflows, backend services, routing, or feature-specific state.

## Requirements

### Requirement: Generic Shared Component Foundation

The system MUST provide reusable shared UI primitives under the shared components area for `Button`, `StatusBadge`, `ModuleCard`, `MetricCard`, and `PageSection`.

#### Scenario: Required primitives are available

- GIVEN future InnHub screens need common UI building blocks
- WHEN developers inspect the shared components area
- THEN the system MUST provide generic `Button`, `StatusBadge`, `ModuleCard`, `MetricCard`, and `PageSection` primitives
- AND those primitives MUST be exported through a predictable shared components entry point

#### Scenario: Components remain generic

- GIVEN a shared UI primitive is used by any future feature module
- WHEN the primitive renders
- THEN it MUST render only from caller-provided props, children, or slots
- AND it MUST NOT require room, reservation, invoice, housekeeping, maintenance, guest, property, or dashboard-specific data types

### Requirement: Button Action Primitive

The system MUST provide a generic `Button` primitive for repeated user actions with accessible button semantics and reusable visual variants.

#### Scenario: Button renders an accessible action

- GIVEN caller-provided button content and standard button attributes
- WHEN the `Button` renders
- THEN it MUST expose native button semantics
- AND it MUST preserve an accessible name from its caller-provided content or attributes

#### Scenario: Button supports interaction states

- GIVEN a button is disabled or loading
- WHEN the `Button` renders
- THEN it MUST prevent normal user activation while unavailable
- AND it SHOULD expose loading or busy state in an accessibility-friendly way

### Requirement: StatusBadge Tone Primitive

The system MUST provide a generic `StatusBadge` primitive for displaying caller-provided labels with reusable visual tones.

#### Scenario: StatusBadge renders caller-provided status text

- GIVEN caller-provided label content
- WHEN the `StatusBadge` renders
- THEN it MUST display that label without deriving business meaning from it

#### Scenario: StatusBadge avoids domain mappings

- GIVEN a feature needs to display a room, reservation, invoice, cleaning, or maintenance state
- WHEN that feature uses `StatusBadge`
- THEN the feature MUST choose the label and visual tone outside the shared primitive
- AND the shared primitive MUST NOT encode domain-specific status-to-tone rules

### Requirement: ModuleCard Content Primitive

The system MUST provide a generic `ModuleCard` primitive for reusable module summaries, navigation placeholders, or feature entry cards.

#### Scenario: ModuleCard renders flexible content slots

- GIVEN caller-provided title content and optional supporting content
- WHEN the `ModuleCard` renders
- THEN it MUST display the title
- AND it SHOULD support optional description, eyebrow, icon, and action content without requiring any specific domain module

#### Scenario: ModuleCard remains independent from routing

- GIVEN module navigation behavior may be introduced later
- WHEN `ModuleCard` is implemented for this change
- THEN it MUST NOT require route constants, router links, protected-route behavior, or navigation shell decisions
- AND callers MAY provide action content when navigation or actions are needed

### Requirement: MetricCard Display Primitive

The system MUST provide a minimal generic `MetricCard` primitive for displaying caller-provided metric labels and values.

#### Scenario: MetricCard renders a metric summary

- GIVEN caller-provided metric label and value content
- WHEN the `MetricCard` renders
- THEN it MUST display the label and value clearly
- AND it SHOULD support optional helper or trend content supplied by the caller

#### Scenario: MetricCard does not calculate business metrics

- GIVEN a dashboard, report, or feature module has derived operational metrics
- WHEN that module uses `MetricCard`
- THEN metric calculation MUST happen outside the shared primitive
- AND the shared primitive MUST NOT import feature services, report models, or business rules

### Requirement: PageSection Layout Primitive

The system MUST provide a generic `PageSection` primitive for repeated page-section scaffolding without introducing a full application layout.

#### Scenario: PageSection renders section structure

- GIVEN caller-provided section heading content and optional supporting content
- WHEN the `PageSection` renders
- THEN it MUST provide a reusable section structure
- AND it SHOULD support optional eyebrow, description, actions, and children content

#### Scenario: PageSection avoids premature AppLayout behavior

- GIVEN routing, navigation, authentication, and protected layout are outside this change
- WHEN `PageSection` is implemented
- THEN it MUST NOT introduce global navigation, route protection, sidebar behavior, or authenticated app-shell decisions

### Requirement: Current Shell Uses Shared Primitives Without Behavior Change

The system MUST refactor the current app shell to use `PageSection` and `ModuleCard` as moderate usage evidence while preserving existing visible behavior and i18n behavior.

#### Scenario: Existing localized shell content remains available

- GIVEN the current app shell renders in English or Spanish
- WHEN the shell is refactored to use shared UI primitives
- THEN existing localized hero, foundation, accessibility, and module label content MUST remain available through i18n resources
- AND the refactor MUST NOT hardcode new user-facing shell copy in JSX

#### Scenario: Refactor stays focused

- GIVEN the app shell uses shared primitives as usage evidence
- WHEN reviewers inspect the change
- THEN the refactor MUST remain limited to current shell composition and module cards
- AND it MUST NOT introduce business workflows, backend data, routing, protected layout, or unrelated feature screens

### Requirement: Shared UI Architecture Boundaries

Shared UI primitives MUST remain presentation-only and MUST respect InnHub's frontend architecture boundaries.
(Previously: Prohibited modal system alongside external UI libraries)

#### Scenario: No backend or feature dependencies

- GIVEN reviewers inspect shared UI component files
- WHEN they review imports and component behavior
- THEN shared UI primitives MUST NOT import backend clients, InsForge services, feature services, feature modules, route constants, or domain-specific status maps

#### Scenario: No full design system scope creep

- GIVEN this change establishes the first shared UI foundation
- WHEN the primitives are implemented
- THEN the system MUST NOT add Storybook, table system, form system, or complex polymorphic component framework
- AND the system MUST permit lucide-react as the sole icon package, restricted to navigation and shared icon usage
- AND all other external UI libraries remain prohibited

### Requirement: Modal Component

The system MUST provide a reusable, domain-neutral Modal component under the shared components area for overlay dialogs.

#### Scenario: Modal renders overlay with content

- GIVEN the Modal is open (isOpen=true)
- WHEN the Modal renders
- THEN it MUST render a backdrop overlay and the caller-provided children content
- AND it MUST render above all other page content

#### Scenario: Modal closes on Escape key

- GIVEN the Modal is open
- WHEN the user presses the Escape key
- THEN the Modal MUST call its onClose callback
- AND it MUST NOT submit forms or trigger unrelated actions

#### Scenario: Modal closes on backdrop click

- GIVEN the Modal is open
- WHEN the user clicks outside the modal content area on the backdrop
- THEN the Modal MUST call its onClose callback

#### Scenario: Modal remains domain-neutral

- GIVEN a Modal is used by any future feature module
- WHEN the Modal renders
- THEN it MUST render only from caller-provided props (isOpen, onClose, children)
- AND it MUST NOT require auth, session, property, reservation, or any domain-specific data types

#### Scenario: Modal tests verify behavior

- GIVEN strict TDD is enabled
- WHEN the Modal component is tested
- THEN tests MUST verify open/close rendering, Escape key close, backdrop click close, and domain-neutral import boundaries

### Requirement: Test and Quality Coverage

The system MUST include focused tests for the shared UI primitives and preserve existing app/i18n regression coverage.

#### Scenario: Component behavior is tested

- GIVEN the shared UI primitives are implemented
- WHEN the test suite runs
- THEN tests MUST cover core rendering and accessibility-relevant behavior for the new primitives
- AND tests SHOULD avoid brittle assertions against complete Tailwind class strings

#### Scenario: Project quality checks pass

- GIVEN the change is ready for verification
- WHEN project checks are run
- THEN `npm run test:run` MUST pass
- AND `npm run lint` MUST pass
- AND `npm run build` MUST pass

### Requirement: Multi-Role Demo Credentials

The system MUST expose demo credentials for multiple InnHub accounts with distinct AppProfileRoles so evaluators and automated tests can authenticate as any of the 5 roles.

> **Merge note**: The `getDemoAccount(role)` and `getAllDemoAccounts()` utility functions are implemented in `demoCredentials.ts`. LoginForm UI integration for role selection is **pending a future change** — evaluators can use direct URL access or modify code to verify multi-role behavior via login.

#### Scenario: Demo credentials available for all 5 roles

- GIVEN demo credentials are configured
- WHEN the system resolves available demo accounts
- THEN the system MUST provide credentials for accounts with administrator, manager, receptionist, housekeeping, and maintenance roles

#### Scenario: Role-to-credential mapping interface

- GIVEN a test or evaluation flow requires a specific role
- WHEN it queries demo credentials by role
- THEN the system MUST return the corresponding credentials for the requested role
- AND it MUST return undefined or null for roles without configured credentials

## Acceptance Criteria

- `Button`, `StatusBadge`, `ModuleCard`, minimal `MetricCard`, and `PageSection` exist under `src/shared/components`.
- Shared components are exported through predictable shared component entry points.
- Shared components render caller-provided content and remain domain-neutral.
- Shared components do not import backend services, InsForge clients, feature modules, route constants, or domain-specific status mappings.
- `PageSection` is implemented instead of a full `AppLayout` for this change.
- `MetricCard` is implemented with a minimal display-only role and no metric calculations.
- `App.tsx` uses `PageSection` and `ModuleCard` moderately while preserving existing i18n behavior.
- No new external UI library, Storybook setup, icon package, modal/table/form system, routing shell, or protected layout is introduced.
- Tests cover core rendering/accessibility behavior for the new primitives and existing i18n app tests remain compatible.
- `npm run test:run`, `npm run lint`, and `npm run build` pass during verification.
- Review workload is forecast against the 400 changed-line budget before apply; if the forecast exceeds the budget, apply MUST pause for a split/defer decision.
