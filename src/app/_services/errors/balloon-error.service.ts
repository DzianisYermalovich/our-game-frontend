import { Injectable, signal } from '@angular/core';
import { ErrorBase } from '../../_models/error-base';

@Injectable({
  providedIn: 'root',
})
export class BalloonErrorService {
  private readonly errorState = signal<ErrorBase | null>(null);

  /** The current error, or null when no error is shown. */
  public readonly error = this.errorState.asReadonly();

  public raise(description: string): void {
    this.errorState.set({ description });
  }
}
