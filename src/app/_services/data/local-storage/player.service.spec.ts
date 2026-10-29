import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlayerService } from './player.service';
import { GameService } from './game.service';
import { ScoreUpdateService } from '../../component-communication/score-update.service';
import { makeValidGame } from '../../../../testing/game-fixture';

describe('PlayerService', () => {
  let service: PlayerService;
  let scoreUpdateService: ScoreUpdateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    TestBed.inject(GameService).create(makeValidGame());
    service = TestBed.inject(PlayerService);
    scoreUpdateService = TestBed.inject(ScoreUpdateService);
  });

  it('getPlayersByGameId() returns the players of the game', () => {
    expect(service.getPlayersByGameId('1').length).toBe(2);
  });

  it('getPlayersByGameId() returns [] for an unknown game', () => {
    expect(service.getPlayersByGameId('nope')).toEqual([]);
  });

  it('updateScore() adds the price to the player score and bumps the version', () => {
    expect(scoreUpdateService.version()).toBe(0);

    service.updateScore('1', '2', 500);
    expect(scoreUpdateService.version()).toBe(1);
    expect(service.getPlayersByGameId('1').find((p) => p.id === '2')?.score).toBe(500);

    service.updateScore('1', '2', -200);
    expect(service.getPlayersByGameId('1').find((p) => p.id === '2')?.score).toBe(300);
  });

  it('updateScore() ignores an unknown player', () => {
    service.updateScore('1', 'unknown', 500);
    expect(scoreUpdateService.version()).toBe(0);
  });
});
