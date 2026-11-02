# 0002 — Stored imported media behind a MediaStorage interface with S3-style gameId/path keys

With import-only game distribution (ADR-pending effort `.scratch/game-import/`), per-question
media (JPG/PNG, MP3) must live in the browser with no backend. The initial research
(`research/browser-media-storage` branch) recommended IndexedDB keyed by content hash, with a
path→hash mapping so author-facing filename refs could resolve to blobs. The maintainer
reframed it: model media storage like S3 — keys are `"<gameId>/<path>"` (a folder per Game,
the zip's subfolder structure preserved, `path` being exactly the author's zip-root-relative
reference), accessed only through a narrow interface:

- `put(gameId, path, blob)`, `get(gameId, path)`, `deleteGame(gameId)`

The v1 implementation is `IdbMediaStorage` (one IndexedDB object store, string keys, Blob
values via structured clone, prefix-range delete per Game). A future `S3MediaStorage` or any
other backend implements the same interface. Because the reference *is* the storage key, the
stored Game JSON stays author-verbatim — no hashes, no manifest, no mapping layer.

Accepted consequences: no cross-Game dedupe (identical bytes in two packs are stored twice —
negligible); media files are stored as-is without integrity hashing; deleting a Game must
always call `deleteGame` so media never outlives its Game; export enumerates media via the
Game JSON's own refs, so the interface needs no `list()`.

Considered options: content-hash keys + a path→hash mapping (rejected: an entire mapping
layer and manifest/index design existed only to serve hash keys, which bought cross-Game
dedupe this app doesn't need); OPFS (rejected: Safari <26 cannot write on the main thread —
dedicated worker required); data URLs in localStorage (rejected: ~5 MiB origin cap with +33%
base64 inflation, synchronous main-thread rewrites); Cache API (rejected: semantically for
re-fetchable HTTP responses, not irreplaceable user data). `navigator.storage.persist()` is
called once after the first successful import to opt out of best-effort eviction (Safari's
7-day wipe, LRU pressure).
