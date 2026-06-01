# Delta for I18n

## ADDED Requirements

### Requirement: Guest Management Localization Coverage

The system MUST provide English and Spanish localization keys for guest management flows, including list/search/filter states, forms, recycle bin, restore, and purge messaging.

#### Scenario: Guest screens render localized copy

- GIVEN the active locale is `en` or `es`
- WHEN the guests module renders active list, trash view, forms, and lifecycle confirmations
- THEN user-facing labels/messages MUST resolve from locale resources
- AND the same semantic keys MUST exist in both English and Spanish resources

#### Scenario: Destructive lifecycle messaging is localized

- GIVEN a user opens soft-delete, restore, or purge confirmations
- WHEN confirmation text is shown
- THEN warnings, blocking messages, and strict-confirmation prompts MUST be localized in both supported locales

## Acceptance Criteria

- Guest-management localization keys exist in both English and Spanish resources.
- List/search/filter, loading/empty/error states, form labels, recycle bin, restore, purge, and reservation-blocking messages are localized.
- Locale behavior remains consistent with canonical i18n fallback policy.
