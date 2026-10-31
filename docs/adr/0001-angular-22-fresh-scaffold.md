# 0001 — Rebuilt the workspace on a fresh Angular 22 scaffold instead of stepping majors

The app was two years' worth of majors behind (Angular 7.1, late 2018) with a toolchain
(webpack builder, tslint, Karma, Protractor) that is discontinued by Angular 22. Stepping
through ~15 `ng update` rounds would have migrated us through several of those dead tools just
to remove them again, at ~15 dependency-alignment cycles. Because the app is small (~58 source
files, 10 components, no backend), we instead generated a fresh Angular 22 scaffold in the repo
root and ported the source into it as fully modern Angular (standalone, signals, zoneless,
strict TS), replacing Bootstrap 4 with 5 on the way. Accepted consequence: the workspace/config
files' git history is discontinuous (old tree lives on `develop`); app source history is
preserved via the port commits.

Considered options: incremental `ng update` per major (rejected: migrates through dead
toolchains, high cost for a small app); hybrid (ng-update partway for codemods, then rebuild)
(rejected: the codemods' output would be discarded by the rebuild anyway).
