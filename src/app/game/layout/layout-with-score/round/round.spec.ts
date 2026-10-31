import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoundComponent } from './round';

describe('RoundComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RoundComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
