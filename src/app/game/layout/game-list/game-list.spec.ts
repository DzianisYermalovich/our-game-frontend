import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameList } from './game-list';
import { GameService } from '../../../_services/data/local-storage/game.service';
import { Game } from '../../../_models/game';
import { Roles } from '../../../_enums/roles.enum';

describe('GameList', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GameList],
      providers: [provideRouter([])],
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
});
