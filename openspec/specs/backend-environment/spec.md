# Backend Environment Specification

## Purpose

Define the minimum InsForge backend environment foundation required before InnHub implements database schema, authentication flows, or feature data services.

## Requirements

### Requirement: InsForge Environment Variables

The system MUST document the required frontend InsForge environment variables with Vite-compatible names and without committing real secret values.

#### Scenario: Environment example lists required variables

- GIVEN a developer opens `.env.example`
- WHEN they prepare local configuration
- THEN they MUST see placeholders for `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY`
- AND the file MUST NOT contain a real API key, anon key, JWT, or private secret

#### Scenario: Environment naming follows SDK terminology

- GIVEN the InsForge SDK creates a client with `baseUrl` and `anonKey`
- WHEN frontend environment variables are documented or read
- THEN the backend URL variable MUST use `VITE_INSFORGE_BASE_URL`
- AND the anon key variable MUST use `VITE_INSFORGE_ANON_KEY`

### Requirement: InsForge Client Boundary

The system MUST provide a single frontend client/config boundary for InsForge access that can be reused by future feature services.

#### Scenario: Client is created from environment config

- GIVEN valid `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` values are available
- WHEN the application imports the InsForge infrastructure module
- THEN the module MUST create or expose an InsForge client using the official SDK `createClient` pattern
- AND it MUST pass the configured base URL and anon key to the SDK

#### Scenario: Components do not own backend access

- GIVEN React components render application UI
- WHEN reviewers inspect the issue #4 implementation
- THEN JSX components MUST NOT create InsForge clients directly
- AND the approved client/config boundary MUST live outside feature UI components

#### Scenario: Missing configuration is explicit

- GIVEN one or more required InsForge environment values are missing
- WHEN the client/config boundary is evaluated or requested
- THEN the system MUST fail with a clear configuration error or expose an intentional typed missing-config state
- AND the failure MUST NOT expose secret values

### Requirement: Official SDK Usage

The system MUST use the official InsForge TypeScript SDK for application-side backend access preparation.

#### Scenario: SDK dependency is available

- GIVEN the backend environment foundation is implemented
- WHEN dependencies are installed
- THEN `@insforge/sdk` MUST be available to the frontend codebase
- AND the project MUST not introduce an unrelated backend SDK for InsForge access

#### Scenario: SDK documentation is consulted before implementation

- GIVEN integration code is about to be written or changed
- WHEN implementation begins
- THEN current InsForge MCP documentation MUST be fetched for the relevant SDK area
- AND implementation notes MUST record the relevant SDK facts used

### Requirement: Local and Demo Setup Documentation

The system MUST document how developers configure InnHub locally for the connected InsForge backend without storing real secrets in the repository.

#### Scenario: Developer prepares local env file

- GIVEN a developer wants to run the app locally
- WHEN they follow the setup documentation
- THEN they MUST be instructed to copy `.env.example` to `.env.local`
- AND they MUST be told to fill `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` with values from InsForge project settings or MCP metadata

#### Scenario: Documentation preserves secret hygiene

- GIVEN setup documentation mentions backend credentials
- WHEN reviewers inspect the docs
- THEN the docs MUST distinguish placeholder values from real local values
- AND the docs MUST NOT include real anon keys, private API keys, JWTs, or access tokens

### Requirement: Infrastructure-Only Scope

The system MUST keep issue #4 limited to backend environment foundation and MUST NOT implement product workflows or backend schema.

#### Scenario: No database schema work is included

- GIVEN issue #4 is implemented
- WHEN reviewers inspect repository changes and InsForge metadata
- THEN the change MUST NOT create MVP tables, migrations, RLS policies, storage buckets, functions, or seed data

#### Scenario: No feature workflow is implemented

- GIVEN issue #4 is implemented
- WHEN reviewers inspect frontend changes
- THEN the change MUST NOT implement auth screens, reservations, rooms, guests, billing, housekeeping, maintenance, reports, dashboard metrics, realtime subscriptions, or feature CRUD services

### Requirement: Demo Credential Configuration Documentation

The system MUST document any frontend demo credential configuration using Vite-compatible names and placeholder values only.

#### Scenario: Environment example lists demo credential placeholders

- GIVEN the implementation uses frontend-configured demo credentials
- WHEN a developer opens `.env.example`
- THEN the system MUST show placeholder-only demo credential variables with Vite-compatible names
- AND the file MUST NOT contain real passwords, real API keys, anon keys, JWTs, access tokens, or private secrets.

#### Scenario: Demo credential values are treated as public

- GIVEN demo credential variables are exposed to the Vite frontend bundle
- WHEN documentation describes those variables
- THEN it MUST state that such values are public demo-only credentials, not secrets
- AND it MUST warn that production or personal credentials MUST NOT be committed or treated as protected by frontend env naming.

### Requirement: Demo Backend Setup Documentation

The system MUST document the backend state required for demo login without requiring repository-managed production seed data.

#### Scenario: Developer prepares demo backend state

- GIVEN a developer or evaluator wants to use demo login
- WHEN they follow setup documentation
- THEN they MUST be told that a matching InsForge Auth user must exist
- AND an active `profiles` row MUST link that auth user through `profiles.auth_user_id`
- AND the linked profile MUST reference a valid property through `property_id`.

#### Scenario: Documentation preserves setup boundary

- GIVEN demo setup documentation is reviewed
- WHEN reviewers inspect the change
- THEN it MUST NOT claim that repository code creates the external InsForge Auth user unless such provisioning is explicitly implemented and validated
- AND it MUST NOT introduce database schema changes, RLS/policy changes, or production seed data as part of this demo-login change.

### Requirement: Demo Configuration Safe Missing-State Handling

The system MUST define a safe missing-configuration state for demo login that does not expose configured values or backend secrets.

#### Scenario: Missing demo config is explicit and non-secret

- GIVEN one or more required demo credential values are absent or blank
- WHEN the login page needs to decide whether demo access is available
- THEN the system MUST expose an intentional unavailable, disabled, hidden, or safe-error state
- AND the state MUST NOT render passwords, anon keys, tokens, JWTs, raw environment values, or raw backend payloads.

## Acceptance Criteria

- `.env.example` documents `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` with placeholders only.
- `.env.example` documents frontend demo credential variables, when used, with Vite-compatible placeholder names only.
- The frontend has a single InsForge SDK client/config boundary.
- The SDK usage follows current InsForge MCP documentation.
- Missing configuration behavior is clear and does not leak secrets.
- Local/demo setup documentation explains how to create `.env.local` and where to obtain values.
- Demo setup documentation treats frontend demo credentials as public demo-only values and explains the required InsForge Auth user, active linked profile, and property association.
- No real secrets are committed.
- No schema, auth flow expansion, feature CRUD, realtime, storage, functions, production seed data, remote user provisioning, deployment, or UI library work is included.
