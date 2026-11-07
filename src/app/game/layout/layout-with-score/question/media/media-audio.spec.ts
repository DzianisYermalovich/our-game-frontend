import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaAudio } from './media-audio';
import { MEDIA_STORAGE } from '../../../../../_services/media/media-storage';
import { FakeMediaStorage } from '../../../../../../testing/fake-media-storage';
import { mockObjectUrls } from '../../../../../../testing/mock-object-urls';

describe('MediaAudio', () => {
  let mediaStorage: FakeMediaStorage;
  let objectUrls: ReturnType<typeof mockObjectUrls>;

  beforeEach(() => {
    objectUrls = mockObjectUrls();
    mediaStorage = new FakeMediaStorage();
    TestBed.configureTestingModule({
      imports: [MediaAudio],
      providers: [{ provide: MEDIA_STORAGE, useValue: mediaStorage }],
    });
  });

  function makeComponent(ref: string): ComponentFixture<MediaAudio> {
    const fixture = TestBed.createComponent(MediaAudio);
    fixture.componentRef.setInput('gameId', 'game-1');
    fixture.componentRef.setInput('ref', ref);
    return fixture;
  }

  /** Initial CD (effect runs, get() issued), then flush the async resolution and re-render. */
  async function settle(fixture: ComponentFixture<MediaAudio>): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  }

  it('resolves a stored blob into an object URL bound to <audio>', async () => {
    const blob = new Blob(['mp3-bytes'], { type: 'audio/mpeg' });
    await mediaStorage.put('game-1', 'media/c.mp3', blob);
    const fixture = makeComponent('media/c.mp3');

    await settle(fixture);

    const audio = fixture.nativeElement.querySelector('audio');
    expect(audio).not.toBeNull();
    expect(audio.getAttribute('src')).toBe(objectUrls.created[0]);
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(blob);
    expect(objectUrls.revoked).toEqual([]);
  });

  it('renders nothing when the ref has no stored blob', async () => {
    const fixture = makeComponent('media/missing.mp3');

    await settle(fixture);

    expect(objectUrls.createObjectURL).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('audio')).toBeNull();
  });

  it('revokes the URL when the component is destroyed', async () => {
    await mediaStorage.put('game-1', 'media/c.mp3', new Blob(['c']));
    const fixture = makeComponent('media/c.mp3');
    await settle(fixture);

    fixture.destroy();

    expect(objectUrls.revoked).toEqual(objectUrls.created);
  });
});
