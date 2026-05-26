# Delta for shared-ui

## MODIFIED Requirements

### Requirement: Shared UI Architecture Boundaries

Shared UI primitives MUST remain presentation-only and MUST respect InnHub's frontend architecture boundaries.
(Previously: Prohibited all external UI libraries including icon packages)

#### Scenario: No backend or feature dependencies

- GIVEN reviewers inspect shared UI component files
- WHEN they review imports and component behavior
- THEN shared UI primitives MUST NOT import backend clients, InsForge services, feature services, feature modules, route constants, or domain-specific status maps

#### Scenario: No full design system scope creep

- GIVEN this change establishes the first shared UI foundation
- WHEN the primitives are implemented
- THEN the system MUST NOT add Storybook, modal system, table system, form system, or complex polymorphic component framework
- AND the system MUST permit lucide-react as the sole icon package, restricted to navigation and shared icon usage
- AND all other external UI libraries remain prohibited
