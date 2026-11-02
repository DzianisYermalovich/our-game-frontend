# 04: Media playback in the game screen

**What to build:** Games played in the app show and sound their media (spec §5 runtime).
Question and answer views resolve each media ref through `MediaStorage.get()` at render: the
Blob is read once into a signal and bound to `<img>`/`<audio>` as a blob object URL managed
with `effect(onCleanup)`; async callbacks write signals so zoneless change detection is
scheduled. Missing refs degrade quietly — hidden media plus alt text, no error balloon,
no fallback to `/assets` paths. System sounds stay untouched (app chrome). A
historical-style pack (bare filename refs) plays end to end with images and sounds.

**Blocked by:** 03 (Media storage behind the seam).

**Status:** ready-for-agent

- [ ] Question images, question sounds, and answer images render/play from stored blobs on
      the game screen
- [ ] Object URLs are revoked on cleanup — no leak when navigating between questions
- [ ] A ref with no stored blob degrades quietly: media hidden, alt text shown, no balloon,
      no `/assets` fallback attempt
- [ ] System sounds (round begin, auction, cat, super, no-answer) are unchanged
- [ ] Unit tests cover: blob resolution → object URL binding, missing-ref degradation, and
      URL revocation on navigation
- [ ] Manual check: imported pack with images and sounds plays through question → answer
