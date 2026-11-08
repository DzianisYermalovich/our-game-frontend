import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaImage } from './media-image';
import { MEDIA_STORAGE } from '../../../../../_services/media/media-storage';
import { FakeMediaStorage } from '../../../../../../testing/fake-media-storage';
import { mockObjectUrls } from '../../../../../../testing/mock-object-urls';

describe('MediaImage', () => {
  let mediaStorage: FakeMediaStorage;
  let objectUrls: ReturnType<typeof mockObjectUrls>;

  beforeEach(() => {
    objectUrls = mockObjectUrls();
    mediaStorage = new FakeMediaStorage();
    TestBed.configureTestingModule({
      imports: [MediaImage],
      providers: [{ provide: MEDIA_STORAGE, useValue: mediaStorage }],
    });
  });

  function makeComponent(ref: string): ComponentFixture<MediaImage> {
    const fixture = TestBed.createComponent(MediaImage);
    fixture.componentRef.setInput('gameId', 'game-1');
    fixture.componentRef.setInput('ref', ref);
    return fixture;
  }

  /** Initial CD (effect runs, get() issued), then flush the async resolution and re-render. */
  async function settle(fixture: ComponentFixture<MediaImage>): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  }

  it('resolves a stored blob into an object URL bound to <img>', async () => {
    const blob = new Blob(['png-bytes'], { type: 'image/png' });
    await mediaStorage.put('game-1', 'media/x.png', blob);
    const fixture = makeComponent('media/x.png');

    await settle(fixture);

    const img = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe(objectUrls.created[0]);
    expect(img.getAttribute('alt')).toBe('Не правильно указана фотография =(');
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(blob);
    expect(objectUrls.revoked).toEqual([]);
  });

  it('degrades quietly when the ref has no stored blob', async () => {
    const fixture = makeComponent('media/missing.png');

    await settle(fixture);

    expect(objectUrls.createObjectURL).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Не правильно указана фотография =(');
  });

  it('revokes the URL when the ref changes (next question, missing blob)', async () => {
    await mediaStorage.put('game-1', 'media/a.png', new Blob(['a']));
    const fixture = makeComponent('media/a.png');
    await settle(fixture);
    expect(objectUrls.revoked).toEqual([]);

    fixture.componentRef.setInput('ref', 'media/b.png');
    await settle(fixture);

    expect(objectUrls.revoked).toEqual(objectUrls.created);
    expect(objectUrls.created).toHaveLength(1); // the missing b.png created nothing new
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Не правильно указана фотография =(');
  });

  it('revokes the URL when the component is destroyed (navigating away)', async () => {
    await mediaStorage.put('game-1', 'media/a.png', new Blob(['a']));
    const fixture = makeComponent('media/a.png');
    await settle(fixture);

    fixture.destroy();

    expect(objectUrls.revoked).toEqual(objectUrls.created);
  });

  it('re-resolves through the seam when gameId changes (per-game key isolation)', async () => {
    await mediaStorage.put('other-game', 'media/a.png', new Blob(['a']));
    const fixture = makeComponent('media/a.png');
    fixture.componentRef.setInput('gameId', 'game-1');
    fixture.componentRef.setInput('gameId', 'other-game');

    await settle(fixture);

    // game-1/media/a.png does not exist; only other-game/media/a.png does.
    const img = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe(objectUrls.created[0]);
  });
});
