# Delta for I18n

## ADDED Requirements

### Requirement: Demo Selector Localization and Accessibility Copy

The system MUST provide English and Spanish translation resources for all new property-aware demo selector text, including selector guidance, property selection labels, role selection labels, and accessible names.

#### Scenario: English demo selector copy is resource-backed

- GIVEN the active locale is English
- WHEN the property-aware demo account selector renders
- THEN the modal guidance, property selection label, property names, role selection label, role names, and role descriptions MUST resolve from English translation resources
- AND JSX components MUST NOT define ad hoc translation dictionaries for those user-facing strings.

#### Scenario: Spanish demo selector copy is resource-backed

- GIVEN the active locale is Spanish
- WHEN the property-aware demo account selector renders
- THEN the modal guidance, property selection label, property names, role selection label, role names, and role descriptions MUST resolve from Spanish translation resources
- AND the Spanish resources MUST communicate the same available properties, roles, and credential-selection purpose as English.

#### Scenario: Property and role controls are accessible

- GIVEN assistive technology reads the demo account selector
- WHEN focus moves through property and role controls
- THEN each selectable control MUST have a clear accessible name that identifies the property or role it selects
- AND the currently selected property SHOULD be programmatically or visibly distinguishable
- AND the selector MUST remain operable without requiring pointer-only interaction.

#### Scenario: Copy does not imply trusted UI property scope

- GIVEN a user reads the demo selector guidance in any supported locale
- WHEN the selector explains property and role selection
- THEN the copy MUST present property selection as choosing demo credentials
- AND it MUST NOT imply that the UI-selected property bypasses authenticated profile or RLS scope validation.
