# Delta for Auth Session

## ADDED Requirements

### Requirement: Property-Aware Demo Credential Resolution

The system MUST resolve demo credentials from the selected demo property and selected demo role while keeping authenticated property scope derived only from the InsForge-linked profile.

#### Scenario: Default property resolves Tarija credentials

- GIVEN the demo account selector opens for the first time
- WHEN no demo property has been selected yet
- THEN the system MUST default the selected demo property to Hotel Tarija
- AND selecting any role MUST submit the matching Hotel Tarija demo account credentials.

#### Scenario: Non-default property resolves Hostal credentials

- GIVEN the user selects Hostal Los Chapacos in the demo account selector
- WHEN the user selects the Manager role
- THEN the system MUST submit the Hostal Los Chapacos Manager demo account credentials
- AND it MUST NOT submit the Hotel Tarija Manager credentials.

#### Scenario: UI property is not trusted session scope

- GIVEN a user selected a demo property in the login modal
- WHEN demo credentials authenticate successfully
- THEN the authenticated app session MUST still derive its `property_id` from the linked `profiles.auth_user_id` record
- AND the selector MUST NOT create, override, or inject trusted application property scope.

### Requirement: Demo Selector Supports RLS Smoke Testing

The system MUST make both seeded demo properties discoverable from the demo login modal so evaluators can manually validate tenant isolation after RLS is enabled.

#### Scenario: Evaluator can switch between seeded properties

- GIVEN the demo modal is open
- WHEN an evaluator reviews the available demo options
- THEN the selector MUST show Hotel Tarija and Hostal Los Chapacos as selectable demo properties
- AND each property MUST expose the same five demo roles.

#### Scenario: Demo flow supports cross-property isolation checks

- GIVEN RLS is enabled and both seeded properties have active demo profiles
- WHEN an evaluator logs in with a Hotel Tarija demo account and later with a Hostal Los Chapacos demo account
- THEN each login MUST use normal authentication and linked-profile resolution
- AND the selector MUST provide enough visible property context to support comparing same-role access across both properties.

## MODIFIED Requirements

### Requirement: Demo Account Selector

The system MUST provide a DemoAccountSelector component that lets users select one configured demo property and then select one configured role account for that property.
(Previously: The selector listed all configured demo accounts by role without property selection.)

#### Scenario: Selector lists all configured roles

- GIVEN getAllDemoAccounts() returns accounts for administrator, manager, receptionist, housekeeping, and maintenance across supported demo properties
- WHEN the DemoAccountSelector renders
- THEN it MUST display all 5 demo role options for the currently selected property with their role names
- AND each entry MUST indicate the role it authenticates as
- AND entries MUST include a description distinguishing each role's scope.

#### Scenario: Selecting a role triggers login

- GIVEN the user is viewing the demo account selector
- WHEN the user selects a specific demo property and demo role
- THEN the system MUST call login() with that property-role account's credentials through the existing auth-session boundary
- AND authentication MUST proceed through the approved InsForge auth flow
- AND the selector MUST NOT create InsForge clients or call InsForge directly.

#### Scenario: Selector integrates via the shared Modal

- GIVEN the login form shows a "Demo accounts" trigger
- WHEN the user activates the trigger
- THEN the DemoAccountSelector MUST render inside the shared Modal component
- AND the user MAY close the selector via Escape key, backdrop click, or close button.

#### Scenario: Selector is testable with mock credentials

- GIVEN strict TDD is enabled
- WHEN the DemoAccountSelector is tested
- THEN tests MUST verify that both configured demo properties render as selectable items
- AND tests MUST verify that all configured roles render for the selected property
- AND selecting a role calls onSelect with the correct credentials for that selected property and role
- AND tests MUST NOT depend on real InsForge auth or network calls.

### Requirement: Demo Login Uses Existing Auth Session Flow

The system MUST submit property-aware demo credentials through the same controlled auth/session login flow used by manual login.
(Previously: Demo login submitted role-only demo credentials through the existing login flow.)

#### Scenario: Demo login submits through the existing login boundary

- GIVEN demo credentials are configured for a selected property and role
- WHEN the user activates the demo-login option
- THEN the system MUST call the existing login/auth-session boundary with those credentials
- AND authentication MUST proceed through the approved InsForge auth boundary
- AND JSX components MUST NOT create InsForge clients or call InsForge auth/database APIs directly.

#### Scenario: Manual login behavior is preserved

- GIVEN the login page supports manual email/password login
- WHEN the property-aware demo-login option is added
- THEN manual login MUST continue to submit user-provided credentials through the existing login/auth-session boundary
- AND manual login failures MUST remain safe and understandable.

#### Scenario: Property-aware demo login preserves linked profile validation

- GIVEN a user selects any demo property and role
- WHEN authentication succeeds through InsForge
- THEN the app session MUST still resolve the linked InnHub profile by `profiles.auth_user_id`
- AND protected access MUST remain blocked when the linked profile is missing, inactive, or has no valid property.
