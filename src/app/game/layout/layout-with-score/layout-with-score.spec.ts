import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LayoutWithScore } from './layout-with-score';

describe('LayoutWithScore', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LayoutWithScore],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create with an empty players list when no game exists', () => {
    const fixture = TestBed.createComponent(LayoutWithScore);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.players()).toEqual([]);
  });
});
