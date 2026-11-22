import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Home>>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('«Продолжить игру» leads to the saved-games list', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const continueButton = [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Продолжить игру'),
    );
    continueButton.click();
    expect(navigate).toHaveBeenCalledWith(['game']);
  });
});
