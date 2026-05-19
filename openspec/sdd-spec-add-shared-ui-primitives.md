# SDD Spec — add-shared-ui-primitives

## Status

pass

## Executive Summary

Created the SDD spec for InnHub change `add-shared-ui-primitives` / issue #22. Because no canonical `shared-ui` spec exists yet, this phase wrote a full new domain specification for shared UI primitives. The spec requires generic, domain-neutral `Button`, `StatusBadge`, `ModuleCard`, minimal `MetricCard`, and `PageSection` primitives, plus a focused `App.tsx` refactor using `PageSection` and `ModuleCard` while preserving i18n behavior.

## Artifacts

- Change spec: `openspec/changes/add-shared-ui-primitives/specs/shared-ui/spec.md`

## Requirements Added

- Generic Shared Component Foundation
- Button Action Primitive
- StatusBadge Tone Primitive
- ModuleCard Content Primitive
- MetricCard Display Primitive
- PageSection Layout Primitive
- Current Shell Uses Shared Primitives Without Behavior Change
- Shared UI Architecture Boundaries
- Test and Quality Coverage

## Decisions Reflected

- `PageSection` is specified instead of `AppLayout` to avoid premature routing/protected-layout decisions for issue #3.
- `MetricCard` is specified as a minimal display-only primitive, not deferred.
- `App.tsx` usage is limited to moderate composition evidence with `PageSection` and `ModuleCard`.
- Components must remain prop-driven, domain-neutral, backend-free, and independent from feature modules or route constants.
- Existing i18n resources must remain the source for visible shell copy.

## Existing Spec Lookup

- Canonical spec checked: `openspec/specs/shared-ui/spec.md`
- Result: not found; wrote a full new domain spec under the change folder.
- Active same-domain change warning: none found for `shared-ui`.
- Legacy flat current-change spec warning: none observed.

## Config Rules Applied

- `openspec/config.yaml` requires acceptance criteria for specs; acceptance criteria were included.
- Requirements use RFC 2119 language and each requirement includes testable Given/When/Then scenarios.

## Validation

- Spec artifact written successfully.
- No code implementation was performed in this spec phase.
- No tests were run because this phase only writes specification artifacts.

## Next Recommended

Run SDD design phase for `add-shared-ui-primitives` to define compact component APIs, folder/export structure, accessibility approach, testing strategy, and review-budget forecast before tasks/apply.

## Risks

- Review budget remains a watch item: component code plus tests plus OpenSpec artifacts may approach the 400 changed-line budget. The design/tasks phases should forecast implementation scope and pause before apply if needed.
- The spec intentionally forbids domain status mappings and routing/protected layout behavior; future implementation must keep those concerns outside shared UI.

## Skill Resolution

none — no parent-injected skill paths were available in this delegated runtime; work used the assigned SDD spec role instructions plus project files.

## Memory

Engram persistence was requested, but this delegated runtime does not expose Engram memory tools. The spec has been persisted to OpenSpec artifacts; the parent session should save `sdd/add-shared-ui-primitives/spec` to Engram if available.
