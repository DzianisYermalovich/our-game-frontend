import { Component, effect, inject, signal } from '@angular/core';
import { BalloonErrorService } from '../../_services/errors/balloon-error.service';

@Component({
  selector: 'app-ballon-error',
  templateUrl: './ballon-error.html',
  styleUrl: './ballon-error.scss',
})
export class BallonError {
  private readonly errorService = inject(BalloonErrorService);

  public readonly error = this.errorService.error;
  public readonly show = signal(false);

  constructor() {
    // A second error within 5s still hides early — preserved from the Angular 7 behavior.
    effect(() => {
      if (this.error()) {
        this.show.set(true);
        setTimeout(() => this.show.set(false), 5000);
      }
    });
  }
}
