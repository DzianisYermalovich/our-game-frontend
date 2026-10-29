Status: resolved

# 01 — Branch and planning docs

Cut `angular-22-upgrade` off `develop`; commit spec + tickets + GLOSSARY.md + ADR-0001 as the
first commit.

## Notes

- `package-lock.json` had uncommitted npm churn (version sync + optional flags). Classifier
  blocked `git restore`; carried into the branch instead — Phase 1 (ticket 02) replaces the
  lockfile wholesale, so develop stays untouched and nothing is discarded.
- Acceptance: docs exist, first commit on branch contains them.
