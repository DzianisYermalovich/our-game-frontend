import { Component, input } from '@angular/core';
import { mediaObjectUrl } from '../../../../../_services/media/media-object-url';

/**
 * One question/answer image, resolved from stored Game media (spec §5
 * runtime): Blob object URL while the media exists; alt text placeholder
 * when the ref has no stored blob.
 */
@Component({
  selector: 'app-media-image',
  template: `
    @if (url(); as src) {
      <img [src]="src" [alt]="alt()" />
    } @else {
      <div class="text-muted">{{ alt() }}</div>
    }
  `,
  styles: `
    img {
      max-width: 100%;
      max-height: 50vh;
    }
  `,
})
export class MediaImage {
  public readonly gameId = input.required<string>();
  /** Zip-root-relative media ref, exactly as authored in the Game JSON. */
  public readonly ref = input.required<string>();
  public readonly alt = input('Не правильно указана фотография =(');

  /** Blob object URL for the ref; undefined until resolved or when missing. */
  public readonly url = mediaObjectUrl(
    () => this.gameId(),
    () => this.ref(),
  );
}
