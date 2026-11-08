# 04: Media playback in the game screen

**What to build:** Games played in the app show and sound their media (spec §5 runtime).
Question and answer views resolve each media ref through `MediaStorage.get()` at render: the
Blob is read once into a signal and bound to `<img>`/`<audio>` as a blob object URL managed
with `effect(onCleanup)`; async callbacks write signals so zoneless change detection is
scheduled. Missing refs degrade quietly — hidden media plus alt text, no error balloon,
no fallback to `/assets` paths. System sounds stay untouched (app chrome). A
historical-style pack (bare filename refs) plays end to end with images and sounds.

**Blocked by:** 03 (Media storage behind the seam).

**Status:** done

- [x] Question images, question sounds, and answer images render/play from stored blobs on
      the game screen
- [x] Object URLs are revoked on cleanup — no leak when navigating between questions
- [x] A ref with no stored blob degrades quietly: media hidden, alt text shown, no balloon,
      no `/assets` fallback attempt
- [x] System sounds (round begin, auction, cat, super, no-answer) are unchanged
- [x] Unit tests cover: blob resolution → object URL binding, missing-ref degradation, and
      URL revocation on navigation
- [ ] Manual check: imported pack with images and sounds plays through question → answer

## Comments

- The whole object-URL lifecycle lives in one helper, `mediaObjectUrl()` (`_services/media/
  media-object-url.ts`): `effect()` re-reads (gameId, ref) inputs, resolves the Blob through
  `MediaStorage.get()`, and stores `URL.createObjectURL(blob)` in a returned signal — the
  async callback writes a signal, so zoneless CD is scheduled. `effect(onCleanup)` revokes
  the URL and clears the signal on input change or scope destroy; a `disposed` flag drops
  late resolutions. Missing refs (and storage rejections) leave the signal undefined — no
  balloon, no `/assets` attempt.
- Two leaf components consume it next to their only caller: `question/media/media-image.ts`
  (img while resolved; muted alt-text placeholder otherwise) and `question/media/
  media-audio.ts` (audio while resolved; nothing otherwise — for a sound, "quiet" means
  invisible, there is no alt text to show). `question.html` now binds
  `<app-media-image [gameId]="gameId" [ref]="img">` / `<app-media-audio …>` in the QUESTION
  and ANSWER states; the `/assets`-path srcs are gone.
- The `img { max-width/max-height }` rule moved from `question.scss` into `MediaImage`'s own
  styles — emulated encapsulation meant the parent rule could no longer reach an img inside
  the child component; visual output is unchanged. `NgOptimizedImage` deliberately not used:
  blob object URLs are dynamic runtime sources, not static images.
- Revocation on navigation works via component lifecycle: each question navigates to a fresh
  `QuestionComponent`, so the old instance's effects are destroyed and onCleanup fires —
  unit-tested both for ref changes and for fixture.destroy().
- Tests: `mockObjectUrls()` in `src/testing/` stubs `URL.createObjectURL`/`revokeObjectURL`
  (jsdom has neither) and records calls; 8 new tests across media-image.spec / media-audio.spec
  cover resolution→binding (src attribute + exact Blob identity), quiet degradation, revocation
  on ref change and destroy, and per-game key isolation. `question.spec.ts` gained the
  `MEDIA_STORAGE` provider it now needs. Suite: 92 passed (was 84); production build green.
- Left for the human (per ticket): the in-browser manual pass with a real imported pack —
  images and sounds through question → answer. Ticket 06's smoke round-trip covers it end to
  end.
