# Delta for Seed Data

## MODIFIED Requirements

### Requirement: Seed Documentation

The system MUST document seed execution, verification, teardown, and demo-account tenant-isolation smoke testing in `docs/seed-data.md`.
(Previously: Seed documentation described execution, verification, and teardown only.)

#### Scenario: Docs describe execution

- GIVEN reviewers inspect `docs/seed-data.md`
- WHEN they read the document
- THEN it MUST describe executing via InsForge `run-raw-sql`
- AND list expected row counts and a login example per role
- AND identify that the demo dataset contains two seeded properties with five role accounts each.

#### Scenario: Teardown reverses seed

- GIVEN seed data exists
- WHEN the teardown script executes
- THEN it MUST delete seeded auth users by email pattern and cascade through all linked data
- AND re-seeding after teardown MUST restore all data without errors.

#### Scenario: Docs support RLS smoke testing with demo accounts

- GIVEN tenant-scoped RLS is enabled
- WHEN evaluators use the seed documentation to test the demo login flow
- THEN the documentation MUST identify at least one demo account path for Hotel Tarija and one for Hostal Los Chapacos
- AND it SHOULD describe validating that each authenticated session sees only data for its linked property.

## ADDED Requirements

### Requirement: Demo Account Catalog Alignment

The demo credential catalog used by the login UI MUST align with the documented seeded demo properties and roles.

#### Scenario: UI catalog matches seeded properties

- GIVEN seed data documents Hotel Tarija and Hostal Los Chapacos
- WHEN the demo account selector renders its property options
- THEN it MUST include both seeded properties
- AND it MUST NOT introduce a third UI-only demo property without matching seed/profile documentation.

#### Scenario: UI catalog matches seeded roles

- GIVEN each seeded demo property has administrator, manager, receptionist, housekeeping, and maintenance profiles
- WHEN a property is selected in the demo account selector
- THEN the selector MUST provide exactly those five role account options for that property
- AND each option MUST resolve to the documented demo email pattern for the selected property and role.
