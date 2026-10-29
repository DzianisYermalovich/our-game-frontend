import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameComponent } from './game';

describe('GameComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GameComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
