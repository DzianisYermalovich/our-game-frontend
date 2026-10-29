import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SuperRoundComponent } from './super-round';

describe('SuperRoundComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SuperRoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SuperRoundComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
