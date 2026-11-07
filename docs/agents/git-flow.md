# Git workflow: GitHub flow

All agent work is delivered as a pull request. The user reviews and merges — the agent never merges and never writes to a protected branch directly.

## Branches

- `develop` — integration branch. Every feature branch is cut from `origin/develop` and PRs back into it.
- `master` — release-only. Release branches (`Release-*`) and merges into `master` are done by the user, not the agent.
- Protected branches: `develop`, `master`, `Release-*`. Enforced by the PreToolUse hook in `.claude/hooks/git-flow-guardrails.sh` (wired in `.claude/settings.json`), which blocks commits, merges, and pushes on them as well as `gh pr merge`.

## Branch naming

Lowercase kebab-case, optionally prefixed by type: `game-import-validator`, `research/browser-media-storage`, `harness/github-flow`.

## The agent loop

1. **Sync**: `git fetch origin`, then `git switch develop && git pull --ff-only origin develop`.
2. **Branch**: `git switch -c <branch> origin/develop`. Never start work on `develop` itself.
3. **Commit**: small, focused commits on the feature branch; summary line follows recent history (`Summary: detail (ticket NN)` when a ticket applies).
4. **Push**: `git push -u origin <branch>`.
5. **PR**: `gh pr create --base develop` with what/why/how-tested. An open PR with green checks is the definition of done for agent work.
6. **Iterate**: review feedback lands as follow-up commits pushed to the same branch; the PR updates automatically. Then stop — the user validates and merges.

## After merge

`git fetch -p`, switch to `develop`, `git pull --ff-only`, and delete the local feature branch with `git branch -d`.
