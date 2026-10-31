import { TestBed } from '@angular/core/testing';
import { BalloonErrorService } from './balloon-error.service';

describe('BalloonErrorService', () => {
  let service: BalloonErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalloonErrorService);
  });

  it('starts with no error', () => {
    expect(service.error()).toBeNull();
  });

  it('raise() exposes the error description as a signal', () => {
    service.raise('Что-то сломалось');
    expect(service.error()?.description).toBe('Что-то сломалось');
  });
});
