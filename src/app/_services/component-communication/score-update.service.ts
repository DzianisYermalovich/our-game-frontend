import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScoreUpdateService {
  private readonly versionState = signal(0);

  /** Bumped on every score change so score consumers can recompute. */
  public readonly version = this.versionState.asReadonly();

  public bump(): void {
    this.versionState.update((version) => version + 1);
  }
}
