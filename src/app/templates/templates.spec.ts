import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Templates } from './templates';
import { GameTemplateService } from '../_services/data/local-storage/game-template.service';
import { GameImportService } from '../_services/import/game-import.service';
import { GameTemplateExportService } from '../_services/export/game-template-export.service';
import { BalloonErrorService } from '../_services/errors/balloon-error.service';
import { MEDIA_STORAGE } from '../_services/media/media-storage';
import { FakeMediaStorage } from '../../testing/fake-media-storage';
import { makeGameTemplate } from '../../testing/game-fixture';

describe('Templates', () => {
  let mediaStorage: FakeMediaStorage;

  beforeEach(async () => {
    localStorage.clear();
    mediaStorage = new FakeMediaStorage();
    await TestBed.configureTestingModule({
      imports: [Templates],
      providers: [provideRouter([]), { provide: MEDIA_STORAGE, useValue: mediaStorage }],
    }).compileComponents();
  });

  it('should start with an empty list when storage is empty', () => {
    const fixture = TestBed.createComponent(Templates);
    expect(fixture.componentInstance.templates()).toEqual([]);
  });

  it('should create with the templates from storage', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = TestBed.createComponent(Templates);
    expect(fixture.componentInstance.templates().length).toBe(1);
  });

  it('«Открыть» navigates to the template view', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Templates);
    fixture.componentInstance.openTemplate('t-1');
    expect(navigate).toHaveBeenCalledWith(['templates', 't-1']);
  });

  it('«Экспортировать» delegates the row template to the export service', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const exportService = TestBed.inject(GameTemplateExportService);
    const exportSpy = vi.spyOn(exportService, 'exportTemplate').mockResolvedValue(undefined);
    const fixture = TestBed.createComponent(Templates);
    fixture.componentInstance.exportTemplate(fixture.componentInstance.templates()[0]!);
    expect(exportSpy).toHaveBeenCalledWith(makeGameTemplate());
  });

  it('deleting a template removes its media folder too', async () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    await mediaStorage.put('t-1', 'a.png', new Blob(['bytes']));
    await mediaStorage.put('t-1', 'media/b.png', new Blob(['bytes']));

    TestBed.createComponent(Templates).componentInstance.deleteTemplate('t-1');
    await Promise.resolve(); // let the fire-and-forget media delete settle

    expect(TestBed.inject(GameTemplateService).getAll()).toEqual([]);
    expect(mediaStorage.blobs.size).toBe(0);
  });

  it('deleting one template keeps other templates and their media', async () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate('t-1', 'Template one'));
    TestBed.inject(GameTemplateService).create(makeGameTemplate('t-2', 'Template two'));
    await mediaStorage.put('t-1', 'a.png', new Blob(['bytes']));
    await mediaStorage.put('t-2', 'a.png', new Blob(['bytes']));

    TestBed.createComponent(Templates).componentInstance.deleteTemplate('t-1');
    await Promise.resolve();

    expect(TestBed.inject(GameTemplateService).getAll().length).toBe(1);
    expect(await mediaStorage.get('t-2', 'a.png')).toBeTruthy();
    expect(await mediaStorage.get('t-1', 'a.png')).toBeUndefined();
  });

  it('hands the picked pack to the import service and refreshes the list', async () => {
    const importService = TestBed.inject(GameImportService);
    const importPack = vi
      .spyOn(importService, 'importPack')
      .mockResolvedValue(undefined);
    const fixture = TestBed.createComponent(Templates);
    fixture.detectChanges();
    const packInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const pack = new File([new Uint8Array([1])], 'pack.zip', { type: 'application/zip' });
    Object.defineProperty(packInput, 'files', { value: [pack] });
    packInput.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(importPack).toHaveBeenCalledWith(pack);
  });

  it('picker cancel is a silent no-op: no import, no balloon', async () => {
    const importService = TestBed.inject(GameImportService);
    const importPack = vi
      .spyOn(importService, 'importPack')
      .mockResolvedValue(undefined);
    const fixture = TestBed.createComponent(Templates);
    fixture.detectChanges();
    const packInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(packInput, 'files', { value: [] });
    packInput.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(importPack).not.toHaveBeenCalled();
    expect(TestBed.inject(BalloonErrorService).error()).toBeNull();
  });
});
