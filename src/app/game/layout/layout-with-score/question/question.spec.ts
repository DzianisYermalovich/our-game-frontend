import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuestionComponent } from './question';
import { MEDIA_STORAGE } from '../../../../_services/media/media-storage';
import { FakeMediaStorage } from '../../../../../testing/fake-media-storage';

describe('QuestionComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
      providers: [
        provideRouter([]),
        { provide: MEDIA_STORAGE, useValue: new FakeMediaStorage() },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuestionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
