# Icon System Specification

## Purpose

Define how InnHub integrates and uses Lucide icons consistently across navigation, buttons, cards, status badges, and empty states.

## Requirements

### Requirement: Library Selection

Icon system MUST use lucide-react as the sole icon library.

#### Scenario: Library is lucide-react

- GIVEN InnHub requires an icon library
- WHEN the icon system is established
- THEN lucide-react MUST be the selected library
- AND the decision is based on tree-shakeability, bundle size, and React 19 compatibility

### Requirement: Route-Icon Mapping

Every protected route MUST associate a Lucide icon in its metadata.

#### Scenario: All routes have icons mapped

- GIVEN route metadata defines 11 protected routes
- WHEN inspecting each route entry
- THEN each MUST reference a Lucide icon component
- AND icons MUST match their module domain (e.g., LayoutDashboard for dashboard)

### Requirement: Icon Rendering in Navigation

Sidebar navigation MUST render icons alongside route labels.

#### Scenario: Icon renders before label

- GIVEN a navigation item with an icon in metadata
- WHEN SidebarNav renders
- THEN the icon MUST appear before the localized label
- AND icons SHOULD use consistent 20px sizing

#### Scenario: Missing icon is safe

- GIVEN a route has no icon defined
- WHEN navigation renders
- THEN the nav item MUST render gracefully without an icon
- AND no layout disruption shall occur

### Requirement: Icon Accessibility

Icons MUST be accessible when decorative and labeled when standalone.

#### Scenario: Decorative icon is hidden from AT

- GIVEN an icon accompanies a text label
- WHEN the icon renders
- THEN it MUST have aria-hidden="true"
- AND the text label provides the accessible name

#### Scenario: Standalone icon has label

- GIVEN an icon appears without text
- WHEN the icon renders
- THEN it MUST provide an accessible label via aria-label or title
- AND a tooltip SHOULD provide context on hover or focus

### Requirement: Usage Conventions

Icon usage patterns MUST be documented for navigation, buttons, cards, statuses, and empty states.

#### Scenario: Navigation icons follow route mapping

- GIVEN developers add a new protected route
- WHEN extending route metadata
- THEN they MUST assign a Lucide icon matching the module domain
- AND that icon MUST use the same 20px sizing convention

#### Scenario: Button icons supplement actions

- GIVEN a button performs a primary or secondary action
- WHEN the Button primitive renders
- THEN it MAY include a Lucide icon before the label
- AND icon size SHOULD be 16px inside buttons

#### Scenario: Status icons use semantic tones

- GIVEN a status badge shows a state indicator
- WHEN StatusBadge renders
- THEN it MAY include a Lucide icon with consistent tone-to-icon mapping
- AND the icon MUST be decorative with aria-hidden

#### Scenario: Empty state icons are optional

- GIVEN a module has no data to display
- WHEN an empty state renders
- THEN it MAY include a relevant Lucide icon at larger size (48px+)
- AND the icon MUST be decorative with a text message providing context

## Acceptance Criteria

- lucide-react is in package.json as a production dependency
- Every ProtectedRouteMeta entry references a Lucide icon
- SidebarNav renders icons alongside labels at 20px
- Decorative icons have aria-hidden="true"
- Icon conventions are documented for all UI contexts
- `npm run build` and `npm run test:run` pass
