# Delta for App Routing

## MODIFIED Requirements

### Requirement: MVP Module Placeholder Destinations

The system MUST provide placeholders for all MVP modules, with property profile and users under a settings group. Room types MUST be replaced by the real `RoomTypesPage` component instead of a placeholder.
(Previously: All MVP modules, including room types, rendered placeholder components)

#### Scenario: Placeholders reachable at new paths

- GIVEN the protected route group is available
- WHEN navigation destinations are visited
- THEN placeholders MUST exist for dashboard, rooms, guests, reservations, housekeeping, maintenance, billing, and reports at top-level paths
- AND room types MUST render the real `RoomTypesPage` component at its top-level path
- AND placeholders for property profile and users MUST exist under /app/settings/*

#### Scenario: Placeholders do not become feature implementations

- GIVEN a module placeholder (not room types) is rendered
- WHEN the user views the placeholder
- THEN it MUST NOT include operational forms, editable records, real tables, calculated metrics, reservation availability logic, room state transitions, payment behavior, or workflow actions
- AND it MUST NOT implement the Room Status Board
- AND room types, being a real feature page, is exempt from this restriction

## Acceptance Criteria

- The room types route at the top-level path renders `RoomTypesPage` instead of `ModulePlaceholderPage`.
- All other MVP modules remain as placeholders.
- `npm run build` passes with no type errors.
