# Contributing to InnHub

InnHub is an individual academic/professional project. Work should stay issue-first, reviewable, verified, and synchronized through the permanent branch workflow before an issue is closed.

## Quick path

Use this path only after the project owner explicitly approves completing the workflow through `main`.

1. Work on `features` and keep the change tied to one GitHub issue.
2. Review the diff against the issue acceptance criteria. Use `judgment-day` for non-trivial changes.
3. Run the verification gate: `npm run lint`, `npm run build`, and `npm run test:run`.
4. Fix blockers, then rerun the affected verification. If the fix changes behavior, routing, architecture, or tests, re-run `judgment-day`.
5. Commit on `features` with a Conventional Commit message. Load `work-unit-commits` before committing to plan reviewable units.
6. Create a pull request from `features` to `qa` with `Closes #N` in the body. Use `branch-pr` to open the PR and `comment-writer` for the body.
7. Create a pull request from `qa` to `main` with `Closes #N` in the body. Use `branch-pr` to open the PR.
8. Add an evidence comment on the issue with verification results and key decisions. Use `comment-writer` for the comment.
9. Merge the `qa` → `main` pull request (the issue auto-closes via `Closes #N`).
10. Fast-forward `refactor` to `main`: `git checkout refactor && git merge --ff-only main`.
11. Push all branches: `git push origin features qa main refactor`.

## Permanent branches

| Branch | Purpose |
| --- | --- |
| `features` | Normal implementation branch. |
| `qa` | Validation branch before `main`. |
| `main` | Stable, defense-ready branch. |
| `refactor` | Structural fixes and cleanup branch; keep synchronized after successful validation. |

Do not create short-lived feature branches for normal individual-project work unless the project owner asks for one.

## Issue-first rule

Every meaningful change should start from a GitHub issue with scope, acceptance criteria, and expected evidence. Before closing an issue, verify that the implementation satisfies each acceptance criterion.

## Verification gate

Run these before promoting work from `features` to `main`:

```bash
npm run lint
npm run build
npm run test:run
```

Do not continue to commit, branch promotion, or issue closure if any command fails.

When a review finds issues:

1. Fix the blocker or bug.
2. Rerun the failed or affected verification.
3. Run a final review if the fix changes behavior, routing, architecture, or tests.

Expected non-blocking warnings should still be mentioned in the issue evidence. Current examples include Vite large chunk warnings or Node deprecation warnings when commands otherwise pass.

## Recommended skills

These are the installed skills expected for this repository. Load them with the `skill()` tool when the task matches their trigger. Use the smallest safe workflow; do not add ceremony for trivial one-file edits.

| Phase | Skill | When to use |
| --- | --- | --- |
| Codebase investigation | `sdd-explore` | When understanding requires reading 4+ files or mapping unfamiliar flows. |
| Documentation | `cognitive-doc-design` | When writing guides, READMEs, architecture docs, RFCs, or review-facing documents. |
| SDD — Init | `sdd-init` | When starting a new project with SDD or when init has not been run yet. |
| SDD — Proposal | `sdd-propose` | To define scope, technical approach, and risks for a change. |
| SDD — Spec | `sdd-spec` | To write delta specs with requirement scenarios. |
| SDD — Design | `sdd-design` | To plan components, interfaces, data flow, and test plan. |
| SDD — Tasks | `sdd-tasks` | To break specs and design into actionable tasks with a review forecast. |
| SDD — Apply | `sdd-apply` | When an SDD change with tasks, specs, and design is ready. |
| SDD — Verify | `sdd-verify` | To validate implementation against specs, tasks, and tests. |
| SDD — Archive | `sdd-archive` | To close an SDD change and sync delta specs into the main specs. |
| SDD — Onboarding | `sdd-onboard` | To guide someone through their first full SDD cycle on the real codebase. |
| Reviewable commits | `work-unit-commits` | Before committing, to plan logical units that keep tests and docs with the code. |
| Adversarial review | `judgment-day` | Before closing non-trivial issues, before PRs, after fixes, or when acceptance criteria need independent verification. Uses blind dual review with fresh context. |
| Issue creation | `issue-creation` | When creating new GitHub issues. |
| PR creation | `branch-pr` | Only when the project owner asks to open a PR. |
| Large / chained PRs | `chained-pr` | If the change exceeds 400 lines, needs stacked review slices, or the owner approves chained PRs. |
| Comments and reviews | `comment-writer` | For PR comments, issue feedback, review replies, or async project messages. |

Fresh review rule: final reviews must use `judgment-day` with fresh context to avoid bias from having been part of the implementation.

## Completion workflow checklist

### 1. Inspect current state

```bash
git status --short
git branch --show-current
gh issue view <issue-number> --json number,title,body,state,labels,url
```

Confirm:

- [ ] Current branch is `features`.
- [ ] The issue is open and matches the completed work.
- [ ] The diff is limited to the issue scope.

### 2. Review against the issue

Use a fresh review for non-trivial work.

Check:

- [ ] Acceptance criteria are satisfied.
- [ ] Required documentation is updated.
- [ ] Tests cover changed behavior where applicable.
- [ ] No blockers remain.
- [ ] Any intentionally skipped evidence is justified.

### 3. Verify locally

```bash
npm run lint
npm run build
npm run test:run
```

Check:

- [ ] Lint passes.
- [ ] Build passes.
- [ ] Tests pass.
- [ ] Warnings are understood and non-blocking.

### 4. Commit on `features`

Use Conventional Commits:

```text
type(scope): short description
```

Examples:

```text
chore(ui): add icon system navigation visuals
chore(routing): finalize protected module routing
docs(workflow): add contributor workflow guide
```

Commit only after verification passes.

### 5. Promote to qa via pull request

Create a pull request from `features` to `qa` linking the issue:

```bash
gh pr create --base qa --head features \
  --title "type(scope): short description" \
  --body "Closes #N

## Summary
- <what changed and why>

## Evidence
- npm run lint — clean
- npm run build — clean
- npm run test:run — passing"
```

Review and merge to `qa`:

```bash
gh pr merge <number> --merge --subject "type(scope): promote features to qa"
```

### 6. Promote to main via pull request

Create a pull request from `qa` to `main`:

```bash
gh pr create --base main --head qa \
  --title "type(scope): promote qa to main" \
  --body "Closes #N

## Summary
- Promotes verified work from qa to main

## Related PRs
- PR #N features -> qa

## Validation
- npm run lint — clean
- npm run build — clean
- npm run test:run — passing"
```

Add an evidence comment on the issue **before** merging (the merge will auto-close the issue):

```bash
gh issue comment <issue-number> --body "Completed and promoted through the workflow.

Evidence:
- Commit: <hash> <message>
- Review: <fresh review result>
- Verification passed: npm run lint, npm run build, npm run test:run

Notes:
- <short summary of important implementation decisions>"
```

Merge the `qa` → `main` PR (issue auto-closes via `Closes #N` in the body):

```bash
gh pr merge <number> --merge --subject "type(scope): promote qa to main"
```

### 7. Synchronize refactor and confirm

```bash
git checkout refactor
git merge --ff-only main
git checkout features
git push origin refactor
```

Confirm all local and remote permanent branches are aligned:

```bash
git for-each-ref --format='%(refname:short) %(objectname:short)' \
  refs/heads/features refs/heads/qa refs/heads/main refs/heads/refactor \
  refs/remotes/origin/features refs/remotes/origin/qa \
  refs/remotes/origin/main refs/remotes/origin/refactor
```

## Safety rules

- Do not commit, push, merge, close issues, or create PRs without explicit project-owner approval.
- Do not promote work with failing verification.
- Do not close an issue with unresolved blockers.
- Do not mix unrelated issues in one commit.
- Do not introduce a new backend stack, major UI library, or branch strategy without approval.
- Keep generated artifacts, code identifiers, filenames, and commit messages in English.

## Related documents

- [Project context for agents](AGENTS.md)
- [Git workflow](docs/06-git-workflow.md)
- [Architecture](docs/05-architecture.md)
- [Functional specification](docs/07-functional-specification.md)
