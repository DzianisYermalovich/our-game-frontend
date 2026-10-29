import { TestBed } from '@angular/core/testing';
import { BallonError } from './ballon-error';
import { BalloonErrorService } from '../../_services/errors/balloon-error.service';

describe('BallonError', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BallonError],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BallonError);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show and hide the balloon when an error is raised', async () => {
    const fixture = TestBed.createComponent(BallonError);
    fixture.detectChanges();
    const errorService = TestBed.inject(BalloonErrorService);

    errorService.raise('Что-то сломалось');
    fixture.detectChanges();
    expect(fixture.componentInstance.show()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Что-то сломалось');

    // The balloon auto-hides after 5s (real timer — keep the test short by waiting it out).
    await new Promise((resolve) => setTimeout(resolve, 5100));
    fixture.detectChanges();
    expect(fixture.componentInstance.show()).toBe(false);
  }, 10000);
});
