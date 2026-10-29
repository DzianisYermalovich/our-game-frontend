import { TestBed } from '@angular/core/testing';
import { ScoreUpdateService } from './score-update.service';

describe('ScoreUpdateService', () => {
  let service: ScoreUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreUpdateService);
  });

  it('starts at version 0 and bumps monotonically', () => {
    expect(service.version()).toBe(0);
    service.bump();
    expect(service.version()).toBe(1);
    service.bump();
    expect(service.version()).toBe(2);
  });
});
