# Specification: Preference UI

## Purpose
Define the visual, interactive, and placement requirements for the user-facing theme and locale controls, composed as the `PreferenceBar` molecule.

## Requirements

### Requirement: Accessible Theme Toggle Controls
The system MUST provide an accessible visual toggle button (`ThemeToggle`) that allows users to toggle between light and dark themes. The toggle button MUST have a descriptive accessible name (`aria-label`) and reflect the active state using appropriate visual indicators.

#### Scenario: Theme toggle interaction
- GIVEN the active theme is `light`
- WHEN the user clicks the theme toggle button
- THEN the active theme MUST switch to `dark`
- AND the button's accessible name and visual state MUST update to reflect the change

### Requirement: Accessible Locale Toggle Controls
The system MUST provide a visual toggle button (`LanguageToggle`) that allows users to switch between English (`en`) and Spanish (`es`) locales. The toggle button MUST have a descriptive accessible name (`aria-label`) and clearly indicate the currently active locale.

#### Scenario: Locale toggle interaction
- GIVEN the active locale is `en`
- WHEN the user clicks the language toggle button
- THEN the active locale MUST switch to `es`
- AND the UI MUST update all localized strings to Spanish immediately

### Requirement: PreferenceBar Composition and Layout Placement
The system MUST compose both theme and locale toggles in a single reusable `PreferenceBar` molecule. The `PreferenceBar` MUST be mounted in the TopBar (for authenticated users) and in the top-right of both the LoginPage and PublicHomePage (for non-authenticated visitors).

#### Scenario: Authenticated TopBar placement
- GIVEN the user is logged in
- WHEN the `TopBar` is rendered
- THEN the `PreferenceBar` MUST be visible within the header's rightmost controls section

#### Scenario: Login Page placement
- GIVEN the visitor is on the login screen
- WHEN the `LoginPage` is rendered
- THEN the `PreferenceBar` MUST be visible, absolutely positioned in the top-right corner of the page

#### Scenario: Public Home Page placement
- GIVEN the visitor is on the public home screen
- WHEN the `PublicHomePage` is rendered
- THEN the `PreferenceBar` MUST be visible, absolutely positioned in the top-right corner of the page

## Acceptance Criteria
- `ThemeToggle` toggles between `"light"` and `"dark"`, updating DOM theme instantly.
- `LanguageToggle` toggles between `"en"` and `"es"`, triggering language change instantly.
- All preference control buttons are fully keyboard-navigable and have distinct focus outlines.
- All controls have valid `aria-label` translations in both languages.
- `PreferenceBar` is correctly aligned, styled, and mounted in `TopBar`, `LoginPage`, and `PublicHomePage`.
