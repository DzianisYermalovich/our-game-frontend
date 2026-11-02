Type: grilling
Status: resolved
Blocked by: 01, 04

## Question

Given research findings and the travel format: which browser storage backs imported media,
and how do the question template's `<img>`/`<audio>` get their data (blob URLs, async
reads) under zoneless? Lock the mechanism, including the fallback story for oversized packs.

## Answer

Settled with maintainer (2026-11-02). The maintainer proposed the decisive reframe: media
storage is modelled **like S3**, behind an interface — replacing the research's
content-hash-key design (and with it the path→hash mapping question from ticket 04, which
dissolves: the ref path + game id IS the storage key).

- **`MediaStorage` interface** (recorded as an ADR — this is the architecture seam):
  `put(gameId, path, blob)`, `get(gameId, path)`, `deleteGame(gameId)`. S3-style keys
  `"<gameId>/<path>"` — a folder per Game, zip subfolder structure preserved; `path` is
  exactly the author's zip-root-relative ref. Future `S3MediaStorage` (or any backend)
  implements the same interface. No hashes, no manifest, no mapping: the stored Game JSON
  stays author-verbatim.
- **v1 implementation: `IdbMediaStorage`** — IndexedDB (research verdict stands: Blob via
  structured clone; OPFS needs a worker on Safari <26; localStorage dies at ~3–4 MB; Cache
  API is for re-fetchable responses). One object store, string keys; `deleteGame` = prefix
  delete. Same path within one game stored once; cross-game dedupe dropped (negligible).
- **Quota failure: atomic reject.** Import ordering: validate JSON + media presence in zip
  → pre-check id clash (ticket 03's reject, before any bytes are written) → `put()` all
  blobs → `create()` → on any failure `deleteGame()` rolls back partial writes + BalloonError.
  Anything visible in the list is fully stored. No `estimate()` pre-flight heuristic
  (maintainer's call — space problems surface via the failure path). The research ladder's
  Chromium-only File System Access directory-handle escape is **deferred indefinitely** —
  revisit only if real packs ever hit the quota wall; likewise directory-pick import stays
  out (rejected in ticket 04).
- **Persistence: `navigator.storage.persist()` called once after the first successful
  import** — the real eviction guardrail (Safari 7-day wipe, LRU pressure); accepts the
  one-time permission prompt in some browsers.
- **Deletion wiring**: removing a Game from the list must also `deleteGame(gameId)` —
  media never outlives its Game. Export (ticket 06) enumerates media via the Game JSON's
  own refs — no `list()` needed on the interface.
- **Runtime**: `get()` → Blob read once into a signal → blob object URL bound in
  `<img>`/`<audio>` templates via `effect(onCleanup)` (created/revoked per question);
  missing refs degrade to hidden media/alt text (locked in 02/04). Async callbacks write
  signals to schedule zoneless change detection.
