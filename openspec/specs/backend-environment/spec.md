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

## Acceptance Criteria

- `.env.example` documents `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` with placeholders only.
- The frontend has a single InsForge SDK client/config boundary.
- The SDK usage follows current InsForge MCP documentation.
- Missing configuration behavior is clear and does not leak secrets.
- Local/demo setup documentation explains how to create `.env.local` and where to obtain values.
- No real secrets are committed.
- No schema, auth flow, feature CRUD, realtime, storage, functions, seed data, deployment, or UI library work is included.
