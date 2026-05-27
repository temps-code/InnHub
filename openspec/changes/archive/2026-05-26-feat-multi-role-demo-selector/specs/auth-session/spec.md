# Delta for auth-session

## MODIFIED Requirements

### Requirement: Visible Demo Login Option

The system MUST present a visible multi-role demo login option on the login page so evaluators can select and authenticate as any of the 5 InnHub roles without prior credential knowledge.
(Previously: Single env-var-driven "Use demo account" button with no role selection)

#### Scenario: Login page exposes multi-role demo access

- GIVEN a user opens the public login page
- WHEN the login UI renders
- THEN the system MUST show a clear demo-login affordance such as a "Demo accounts" button
- AND activating the affordance MUST present a selector listing available demo roles
- AND the login page MUST continue to support manual email/password login

#### Scenario: Demo access remains limited to auth validation

- GIVEN the multi-role demo-login option is available
- WHEN reviewers inspect the resulting auth UI behavior
- THEN the system MUST NOT introduce public signup, self-service onboarding, invitation flows, or property/profile creation from the login page
- AND it MUST NOT introduce theme/language controls, broad feature CRUD, or unrelated application workflows

## ADDED Requirements

### Requirement: Demo Account Selector

The system MUST provide a DemoAccountSelector component that lists all configured demo accounts by role so users can pick which role to authenticate as.

#### Scenario: Selector lists all configured roles

- GIVEN getAllDemoAccounts() returns accounts for administrator, manager, receptionist, housekeeping, and maintenance
- WHEN the DemoAccountSelector renders
- THEN it MUST display all 5 demo accounts with their role names
- AND each entry MUST indicate the role it authenticates as
- AND entries MUST include a description distinguishing each role's scope

#### Scenario: Selecting a role triggers login

- GIVEN the user is viewing the demo account selector
- WHEN the user selects a specific demo role
- THEN the system MUST call login() with that role's credentials through the existing auth-session boundary
- AND authentication MUST proceed through the approved InsForge auth flow
- AND the selector MUST NOT create InsForge clients or call InsForge directly

#### Scenario: Selector integrates via the shared Modal

- GIVEN the login form shows a "Demo accounts" trigger
- WHEN the user activates the trigger
- THEN the DemoAccountSelector MUST render inside the shared Modal component
- AND the user MAY close the selector via Escape key, backdrop click, or close button

#### Scenario: Selector is testable with mock credentials

- GIVEN strict TDD is enabled
- WHEN the DemoAccountSelector is tested
- THEN tests MUST verify that all configured roles render as selectable items
- AND selecting a role calls onSelect with the correct credentials for that role
- AND tests MUST NOT depend on real InsForge auth or network calls
