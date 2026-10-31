import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuestionComponent } from './question';

describe('QuestionComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuestionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
