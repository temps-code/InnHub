# Delta for I18n Specification

## MODIFIED Requirements

### Requirement: Minimal Preference Controls UI

The system MUST NOT add a full, dedicated user settings page or screen, but it SHALL expose a minimal locale toggle button in visible app shell surfaces to allow the user to switch between English (`en`) and Spanish (`es`) on demand.

#### Scenario: Locale can be switched via toggle UI
- GIVEN the visitor is on any visible page surface (TopBar, LoginPage, PublicHomePage)
- WHEN the user clicks the language toggle button
- THEN the system MUST switch the active language (English ↔ Spanish)
- AND the system MUST persist the new language preference in `innhub.locale`

#### Scenario: Locale can be tested without full settings page
- GIVEN the preference controls are implemented
- WHEN tests verify Spanish rendering or locale switching behavior
- THEN they MAY use i18n APIs, helpers, controlled persisted values, or the language toggle button
- AND they MUST NOT depend on a full user settings page or route
