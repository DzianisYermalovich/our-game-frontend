import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { GameService } from './game.service';
import { BalloonErrorService } from '../../errors/balloon-error.service';
import { makeValidGame } from '../../../../testing/game-fixture';

describe('GameService', () => {
  let service: GameService;
  let controller: HttpTestingController;
  let router: Router;
  let errorService: BalloonErrorService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(GameService);
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    errorService = TestBed.inject(BalloonErrorService);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => controller.verify());

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

  it('initGameFromJson() loads a valid config, stores it and navigates', () => {
    service.initGameFromJson();
    controller.expectOne('assets/temp/initGame.json').flush(makeValidGame());
    expect(service.getById('1')).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith(['game', '1']);
    expect(errorService.error()).toBeNull();
  });

  it('initGameFromJson() raises a balloon error when the config file is missing', () => {
    service.initGameFromJson();
    controller
      .expectOne('assets/temp/initGame.json')
      .flush('not found', { status: 404, statusText: 'Not Found' });
    expect(errorService.error()?.description).toBe('Ошибка при загрузке файла конфигураций!');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('initGameFromJson() rejects a config whose shape mismatches settings', () => {
    const bad = makeValidGame();
    bad.rounds = [];
    service.initGameFromJson();
    controller.expectOne('assets/temp/initGame.json').flush(bad);
    expect(service.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(errorService.error()?.description).toContain('раундов');
  });
});
