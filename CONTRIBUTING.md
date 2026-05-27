# Contributing to InnHub

InnHub is an individual academic/professional project. Work should stay issue-first, reviewable, verified, and synchronized through the permanent branch workflow before an issue is closed.

## Quick path

Use this path only after the project owner explicitly approves completing the workflow through `main`.

1. Work on `features` and keep the change tied to one GitHub issue.
2. Review the diff against the issue acceptance criteria.
3. Run the verification gate: `npm run lint`, `npm run build`, and `npm run test:run`.
4. Fix blockers, then rerun the affected verification.
5. Commit on `features` with a Conventional Commit message.
6. Create a pull request from `features` to `qa` with `Closes #N` in the body, then merge it.
7. Create a pull request from `qa` to `main` with `Closes #N` in the body.
8. Add an evidence comment on the issue with verification results and key decisions.
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

## Recommended agent skills and subagents

These are the installed skills/work patterns expected for this repository. Use the smallest safe workflow; do not add ceremony for trivial one-file edits.

| Phase | Recommended skill or subagent | When to use |
| --- | --- | --- |
| Requirements and scope | `gentle-ai` | Use for non-trivial work, SDD/OpenSpec discipline, acceptance criteria, and approval gates. |
| Documentation design | `cognitive-doc-design` | Use when writing guides, workflow docs, README sections, architecture notes, or review-facing docs. |
| Work-unit planning | `work-unit-commits` | Use before committing implementation work so commits remain reviewable and tests/docs stay with the behavior. |
| Codebase exploration | `scout` or `context-builder` subagent | Use when understanding requires reading 4+ files or mapping unfamiliar flow. |
| Implementation | `worker` subagent | Use for bounded multi-file implementation after scope is clear. Keep one writer unless isolated worktrees are approved. |
| Review | `reviewer` subagent, fresh context | Use before closing non-trivial issues, before PRs, after fixes, or when acceptance criteria must be independently checked. |
| SDD planning | `sdd-proposal`, `sdd-spec`, `sdd-design`, `sdd-tasks` | Use for large, ambiguous, architectural, or product-facing changes. |
| SDD implementation and verification | `sdd-apply`, `sdd-verify`, `sdd-archive` | Use when an OpenSpec/SDD change exists and must be applied, verified, and archived. |
| PR creation | `branch-pr` | Use only when the project owner asks to prepare or open a PR. |
| Large PR splitting | `chained-pr` | Use if a change grows beyond a comfortable review size or needs stacked review slices. |
| Issue creation | `issue-creation` | Use when creating new GitHub issues. |
| Review comments | `comment-writer` | Use when drafting GitHub comments, PR feedback, or issue replies. |

Fresh review rule: final reviews should use a fresh-context `reviewer` so the reviewer is not biased by implementation assumptions.

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
