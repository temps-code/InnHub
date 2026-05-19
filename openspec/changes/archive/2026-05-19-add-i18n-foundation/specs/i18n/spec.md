# I18n Specification

## Purpose

Define a future-ready internationalization foundation for InnHub's current React app shell using `i18next` and `react-i18next`, with English and Spanish resources for visible shell copy and module labels.

## Requirements

### Requirement: I18n Library Foundation

The system MUST initialize internationalization through `i18next` and `react-i18next` exactly once at the application boundary, making translations available to the current app shell without embedding translation resources inside JSX components.

#### Scenario: App shell uses the configured provider

- GIVEN the InnHub React application starts
- WHEN the app shell renders
- THEN translated shell copy MUST be read through the configured i18n foundation
- AND translation resources MUST be maintained outside JSX component markup

#### Scenario: Foundation remains limited to i18n scope

- GIVEN the i18n foundation is added
- WHEN reviewers inspect the change
- THEN it MUST NOT introduce backend language persistence, locale-based routing, an external UI component library, or unrelated business-module UI work

### Requirement: Supported Locale Policy

The system MUST centralize the supported locales as English (`en`) and Spanish (`es`), with English as the default and fallback locale.

#### Scenario: Default English rendering

- GIVEN no valid persisted locale is available
- WHEN the app shell renders
- THEN user-facing shell copy MUST render in English
- AND module labels MUST render from English translation resources

#### Scenario: Spanish rendering

- GIVEN Spanish (`es`) is selected through the i18n foundation or validated locale helper
- WHEN the app shell renders
- THEN user-facing shell copy MUST render in Spanish
- AND module labels MUST render from Spanish translation resources

### Requirement: Persisted Locale Validation

The system MUST read persisted locale preferences only from the `innhub.locale` key and MUST ignore any unsupported locale value by falling back safely to English.

#### Scenario: Valid persisted Spanish locale

- GIVEN `innhub.locale` contains `es`
- WHEN the i18n foundation initializes
- THEN Spanish MUST be used as the active locale

#### Scenario: Invalid persisted locale fallback

- GIVEN `innhub.locale` contains an unsupported value
- WHEN the i18n foundation initializes
- THEN English MUST be used as the active locale
- AND the app MUST continue rendering without a startup error

### Requirement: Resource Coverage for Current Shell

The system MUST provide complete English and Spanish translation resources for the current app shell copy, including hero text, foundation status text, accessibility labels, and planned module labels.

#### Scenario: Current shell strings are resource-backed

- GIVEN the current InnHub shell includes hero copy, foundation status copy, accessibility labels, and planned module labels
- WHEN the shell renders in any supported locale
- THEN each moved user-facing string MUST resolve from that locale's translation resources
- AND the component MUST NOT define ad hoc translation dictionaries inside JSX

#### Scenario: Resources support future module growth

- GIVEN future InnHub features need localized labels
- WHEN new module labels or shell keys are added
- THEN they SHOULD follow the established shared i18n resource structure instead of adding hardcoded UI copy

### Requirement: No User Settings UI

The system MUST NOT add a settings screen, navigation language switcher, or other end-user language preference UI as part of this change.

#### Scenario: Locale can be tested without settings UI

- GIVEN the change is implemented
- WHEN tests verify Spanish rendering or locale switching behavior
- THEN they MAY use i18n APIs, helpers, or controlled persisted values
- AND they MUST NOT depend on a newly added settings UI

## Acceptance Criteria

- The i18n foundation uses `i18next` and `react-i18next`.
- English (`en`) is the default and fallback locale.
- Spanish (`es`) rendering is supported for current app shell copy and module labels.
- Invalid values persisted under `innhub.locale` fall back safely to English.
- Translation resources live outside JSX components.
- The change does not add settings UI, backend locale persistence, locale routing, or an external UI component library.
- Tests cover default English rendering, Spanish rendering, invalid persisted locale fallback, and resource-backed current shell labels.
