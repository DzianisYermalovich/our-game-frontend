import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameList } from './game-list';
import { GameService } from '../../../_services/data/local-storage/game.service';
import { MEDIA_STORAGE } from '../../../_services/media/media-storage';
import { FakeMediaStorage } from '../../../../testing/fake-media-storage';
import { Game } from '../../../_models/game';
import { Roles } from '../../../_enums/roles.enum';

describe('GameList', () => {
  let mediaStorage: FakeMediaStorage;

  beforeEach(async () => {
    localStorage.clear();
    mediaStorage = new FakeMediaStorage();
    await TestBed.configureTestingModule({
      imports: [GameList],
      providers: [provideRouter([]), { provide: MEDIA_STORAGE, useValue: mediaStorage }],
    }).compileComponents();
  });

  it('should create with the games from storage', () => {
    const game: Game = {
      id: '1',
      name: 'TestGame',
      author: { id: 'a', name: 'Author', role: Roles.ADMIN },
      players: [],
      rounds: [],
      superRound: { id: 's', questions: [] },
      settings: {
        id: '0',
        topicsInRound: 0,
        questionsInTopic: 0,
        superQuestions: 0,
        minPrice: 100,
        rounds: 0,
      },
    };
    TestBed.inject(GameService).create(game);

    const fixture = TestBed.createComponent(GameList);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.games().length).toBe(1);
  });

  it('should start with an empty list when storage is empty', () => {
    const fixture = TestBed.createComponent(GameList);
    expect(fixture.componentInstance.games()).toEqual([]);
  });

  it('deleting a Game removes its media folder too', async () => {
    TestBed.inject(GameService).create(makeGame());
    await mediaStorage.put('1', 'a.png', new Blob(['bytes']));
    await mediaStorage.put('1', 'media/b.png', new Blob(['bytes']));

    TestBed.createComponent(GameList).componentInstance.deleteGame('1');
    await Promise.resolve(); // let the fire-and-forget media delete settle

    expect(TestBed.inject(GameService).getAll()).toEqual([]);
    expect(mediaStorage.blobs.size).toBe(0);
  });

  it('deleting one Game keeps other games and their media', async () => {
    TestBed.inject(GameService).create(makeGame());
    TestBed.inject(GameService).create(makeGame('2'));
    await mediaStorage.put('1', 'a.png', new Blob(['bytes']));
    await mediaStorage.put('2', 'a.png', new Blob(['bytes']));

    TestBed.createComponent(GameList).componentInstance.deleteGame('1');
    await Promise.resolve();

    expect(TestBed.inject(GameService).getAll().length).toBe(1);
    expect(await mediaStorage.get('2', 'a.png')).toBeTruthy();
    expect(await mediaStorage.get('1', 'a.png')).toBeUndefined();
  });
});

function makeGame(id = '1'): Game {
  return {
    id,
    name: 'TestGame',
    author: { id: 'a', name: 'Author', role: Roles.ADMIN },
    players: [],
    rounds: [],
    superRound: { id: 's', questions: [] },
    settings: {
      id: '0',
      topicsInRound: 0,
      questionsInTopic: 0,
      superQuestions: 0,
      minPrice: 100,
      rounds: 0,
    },
  };
}
