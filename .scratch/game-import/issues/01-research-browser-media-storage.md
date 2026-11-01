Type: research
Status: resolved

## Question

For per-question media (JPG/PNG, MP3; a few MB total) imported with a Game: compare
IndexedDB, OPFS, data-URLs-in-localStorage, and the Cache API. For each: size limits and
eviction, persistence guarantees, API shape (sync/async), fit with Angular 22 signals +
zoneless (async-read pitfalls). Recommend one primary mechanism (plus fallback) so question
templates can show images and play sounds. Constraint: the app ships no media; everything
arrives via user import.

## Answer

Resolved by a research subagent. Findings live on the throwaway branch
`research/browser-media-storage` (commit `6986d45`, pushed, no PR — never merged):
`.scratch/game-import/research/01-browser-media-storage.md` (226 lines; citations verified
against primary sources — MDN, WHATWG specs, web.dev, angular.dev; unverifiable claims
marked UNVERIFIED inline). Read via `git show research/browser-media-storage:.scratch/game-import/research/01-browser-media-storage.md` or by checking the branch out. Note: the
branch was cut from legacy `master`; the doc targets the Angular 22 workspace on `develop`.

Recommendation: IndexedDB as the primary store for imported per-question media. Picker-imported JPG/MP3 Files go straight into one IndexedDB object store as Blobs (structured clone — no base64, no string limit), keyed by a stable id (content hash preferred, so files shared across questions dedupe); the Game JSON keeps only id references, so the `games` localStorage key stays small and its frequent setItem re-serialization never touches media bytes. IndexedDB beats OPFS (same origin-quota shelf, so no quota win, and Safari cannot write OPFS on the main thread before Safari 26 — a worker with createSyncAccessHandle is required), beats data-URLs-in-localStorage (fixed ~5 MiB per origin before +33% base64 inflation; QuotaExceededError with no recovery; sync main-thread writes), and beats the Cache API (secure-context-only, and semantically for re-fetchable HTTP responses rather than irreplaceable user data). Eviction is identical across IndexedDB/OPFS/Cache — best-effort LRU whole-origin wipes under storage pressure, plus Safari's deletion of all script-writable storage after 7 days without user interaction — so call navigator.storage.persist() after the first import and pre-flight each pack with navigator.storage.estimate(). Oversized-pack fallback ladder: warn at import via estimate(); let the user delete other Games; the only true quota escape is a Chromium-only File System Access directory handle (media stays on disk, handle persisted in IDB, re-permissioned on return); otherwise degrade gracefully to JSON-only import with templates hiding missing images/sounds. Angular 22 fit is identical for the async options: resource()/toSignal resolve Blobs into signals, an effect(onCleanup) creates and revokes blob object URLs bound via <img [src]>/<audio [src]> — and the async callback must write a signal to schedule zoneless change detection (zoneless is the default since v21).
