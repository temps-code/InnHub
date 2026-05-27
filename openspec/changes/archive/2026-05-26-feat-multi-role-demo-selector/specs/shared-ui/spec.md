# Delta for shared-ui

## MODIFIED Requirements

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

## ADDED Requirements

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
