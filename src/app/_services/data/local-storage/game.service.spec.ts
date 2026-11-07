import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { BalloonErrorService } from '../../errors/balloon-error.service';
import { makeValidGame } from '../../../../testing/game-fixture';

describe('GameService', () => {
  let service: GameService;
  let errorService: BalloonErrorService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [],
    });
    service = TestBed.inject(GameService);
    errorService = TestBed.inject(BalloonErrorService);
  });

  it('getAll() returns [] when storage is empty', () => {
    expect(service.getAll()).toEqual([]);
  });

  it('create() stores the game and getById() finds it', () => {
    const game = makeValidGame();
    expect(service.create(game)).toEqual(game);
    expect(service.getById('1')).toEqual(game);
    expect(service.getAll().length).toBe(1);
  });

  it('create() refuses a duplicate id and raises a balloon error', () => {
    service.create(makeValidGame());
    expect(service.create(makeValidGame())).toBeNull();
    expect(errorService.error()?.description).toContain('уже существует');
  });

  it('delete() removes the game from storage', () => {
    service.create(makeValidGame());
    service.delete('1');
    expect(service.getAll()).toEqual([]);
  });
});
