import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { GameImportService } from '../_services/import/game-import.service';
import { BalloonErrorService } from '../_services/errors/balloon-error.service';
import { MEDIA_STORAGE } from '../_services/media/media-storage';
import { FakeMediaStorage } from '../../testing/fake-media-storage';

describe('Home', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Home>>;
  let importService: GameImportService;
  let packInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: MEDIA_STORAGE, useClass: FakeMediaStorage }],
    }).compileComponents();
    importService = TestBed.inject(GameImportService);
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    packInput = fixture.nativeElement.querySelector('input[type="file"]');
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('«Новая игра» opens the native file picker', () => {
    const click = vi.spyOn(packInput, 'click');
    const newGameButton = [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Новая игра'),
    );
    newGameButton.click();
    expect(click).toHaveBeenCalled();
  });

  it('hands the picked pack to the import service', () => {
    const importPack = vi.spyOn(importService, 'importPack').mockResolvedValue(undefined);
    const pack = new File([new Uint8Array([1])], 'pack.zip', { type: 'application/zip' });
    Object.defineProperty(packInput, 'files', { value: [pack] });
    packInput.dispatchEvent(new Event('change'));
    expect(importPack).toHaveBeenCalledWith(pack);
  });

  it('picker cancel is a silent no-op: no import, no balloon', () => {
    const importPack = vi.spyOn(importService, 'importPack').mockResolvedValue(undefined);
    Object.defineProperty(packInput, 'files', { value: [] });
    packInput.dispatchEvent(new Event('change'));
    expect(importPack).not.toHaveBeenCalled();
    expect(TestBed.inject(BalloonErrorService).error()).toBeNull();
  });
});
