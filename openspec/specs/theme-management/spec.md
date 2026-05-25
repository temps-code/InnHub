# Specification: Theme Management

## Purpose
Define the behavior for theme preferences in InnHub, allowing users to switch between light and dark modes, persisting their preference, and checking OS settings on first load.

## Requirements

### Requirement: Theme Persistence and DOM Application
The system MUST initialize the application theme and apply it as a `data-theme` attribute on the `<html>` element. It MUST persist the chosen theme value in `localStorage` under the key `innhub.theme`.

#### Scenario: Apply theme on startup
- GIVEN a theme is stored in `innhub.theme` or detected from OS preferences
- WHEN the application loads
- THEN the system MUST set the `data-theme` attribute on the `<html>` element to match this theme

#### Scenario: Toggle and persist theme
- GIVEN the application is running
- WHEN the theme is toggled by the user
- THEN the system MUST update the `data-theme` attribute on the `<html>` element
- AND the system MUST store the new value (`light` or `dark`) in `localStorage` under `innhub.theme`

### Requirement: Default Theme Resolution
The system MUST resolve the default theme using the sequence: first, a valid persisted value in `innhub.theme` (`light` or `dark`); second, the operating system's color scheme preference (`prefers-color-scheme: dark` resolves to `dark`); third, falling back to a default value of `light`.

#### Scenario: Resolution with stored value
- GIVEN `innhub.theme` is set to `dark`
- WHEN the system resolves the initial theme
- THEN the resolved theme MUST be `dark`

#### Scenario: Resolution with OS preference and no stored value
- GIVEN `innhub.theme` is empty
- AND the system detects the OS preference `prefers-color-scheme: dark` is active
- WHEN the system resolves the initial theme
- THEN the resolved theme MUST be `dark`

#### Scenario: Resolution fallback to light
- GIVEN `innhub.theme` is empty
- AND the system detects no OS preference or OS prefers light scheme
- WHEN the system resolves the initial theme
- THEN the resolved theme MUST be `light`

#### Scenario: Safe recovery from invalid stored theme
- GIVEN `innhub.theme` is set to an invalid value (e.g. `"invalid-value"`)
- WHEN the system resolves the initial theme
- THEN the resolved theme MUST fall back using the OS preference or default to `light`
- AND the system MUST NOT throw a startup error

## Acceptance Criteria
- Themes supported are strictly `"light"` and `"dark"`.
- The active theme is applied as `<html data-theme="...">`.
- The resolved theme persists in `localStorage` under `innhub.theme`.
- OS theme preferences (`prefers-color-scheme`) are respected if no theme is stored.
- Any invalid stored values default to OS preference or `"light"`.
