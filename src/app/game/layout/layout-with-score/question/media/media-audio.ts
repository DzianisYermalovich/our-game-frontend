import { Component, input } from '@angular/core';
import { mediaObjectUrl } from '../../../../../_services/media/media-object-url';

/**
 * The question sound, resolved from stored Game media (spec §5 runtime):
 * Blob object URL while the media exists; rendered as nothing when the ref
 * has no stored blob.
 */
@Component({
  selector: 'app-media-audio',
  template: `
    @if (url(); as src) {
      <audio [src]="src" controls></audio>
    }
  `,
})
export class MediaAudio {
  public readonly gameId = input.required<string>();
  /** Zip-root-relative media ref, exactly as authored in the Game JSON. */
  public readonly ref = input.required<string>();

  /** Blob object URL for the ref; undefined until resolved or when missing. */
  public readonly url = mediaObjectUrl(
    () => this.gameId(),
    () => this.ref(),
  );
}
