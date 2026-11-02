Type: grilling
Status: resolved
Blocked by: 01

## Question

How does media travel with an imported Game: JSON plus loosely picked files (multi-select),
a zip archive, or a directory pick? How do question records reference their files (today
bare filenames like `image3.jpg` / `sound1.mp3` in `answerImage`/`image`/`sound`)? Pick the
format authors produce and the reference scheme inside the Game JSON.

## Answer

Settled with maintainer (2026-11-02):

- **Artifact: a single `.zip`**, selected through ticket 02's flow unchanged (button →
  picker → parse → validate → create → navigate). Packs travel as one shareable file;
  unzip via `fflate` (implementation choice); ticket 06's export becomes the inverse
  (re-zip). Multi-select lost (packs don't travel as one file, forgot-a-file failures);
  directory pick lost (Chromium-only).
- **Layout**: exactly one `.json` at the zip root = the Game; media files beside it, flat
  by convention (subfolders allowed — zip preserves paths).
- **Authoring refs: zip-root-relative paths** in `Question.image`/`sound`/`answerImage` —
  bare filenames by convention (`"image3.jpg"`), subfolders allowed (`"images/x.jpg"`).
  Historical packs import unchanged: same bare-filename authoring, just zipped.
- **Stored refs: author-facing path strings stay forever.** The `Question` model never
  changes; stored Games stay human-readable; content hashes never appear in author or
  stored JSON (hand-writing a hash ref is impossible anyway). Hashes remain internal to
  the media store; the path→hash mapping's exact home (Game JSON manifest field vs
  IndexedDB index) is finalized in ticket 05.
- **Import mechanics**: unreferenced zip files (`__MACOSX`, `.DS_Store`, …) ignored;
  validation = ticket 02's media-presence check over the zip's file set — missing refs
  block the import with a BalloonError naming them; refs escaping the zip root are
  rejected; no media-type policing (the browser degrades at render).
- **Legacy**: no runtime fallback to `/assets/images|sounds` — those directories never
  carry game content again. Old games with dead refs render via ticket 02's graceful
  degradation (missing media hidden with alt text). No special-casing.
