# Delta for shared-ui

## ADDED Requirements

### Requirement: Multi-Role Demo Credentials

The system MUST expose demo credentials for multiple InnHub accounts with distinct AppProfileRoles so evaluators and automated tests can authenticate as any of the 5 roles.

#### Scenario: Demo credentials available for all 5 roles

- GIVEN demo credentials are configured
- WHEN the system resolves available demo accounts
- THEN the system MUST provide credentials for accounts with administrator, manager, receptionist, housekeeping, and maintenance roles

#### Scenario: Role-to-credential mapping interface

- GIVEN a test or evaluation flow requires a specific role
- WHEN it queries demo credentials by role
- THEN the system MUST return the corresponding credentials for the requested role
- AND it MUST return undefined or null for roles without configured credentials
