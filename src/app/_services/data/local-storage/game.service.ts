import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Game } from '../../../_models/game';
import { ErrorBase } from '../../../_models/error-base';
import { BalloonErrorService } from '../../errors/balloon-error.service';
import { GameServiceInterface } from '../game-service-interface';
import { validateGame } from '../../../_validators/game-validator';

const GAMES_KEY = 'games';

@Injectable({
  providedIn: 'root',
})
export class GameService implements GameServiceInterface {
  private readonly http = inject(HttpClient);
  private readonly errorService = inject(BalloonErrorService);
  private readonly router = inject(Router);

  public create(game: Game): Game | null {
    const games = this.getAll();
    if (this.checkIsGameExist(game.id)) {
      this.sendError(`Игра с Id ${game.id} уже существует`);
      return null;
    } else {
      games.push(game);
      localStorage.setItem(GAMES_KEY, JSON.stringify(games));
      return game;
    }
  }

  public delete(id: string): void {
    const games = this.getAll();
    const gameIndex = games.findIndex((item) => item.id === id);
    games.splice(gameIndex, 1);
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  }

  public getAll(): Game[] {
    const games = JSON.parse(localStorage.getItem(GAMES_KEY) ?? '[]') as Game[];
    return games ?? [];
  }

  public getById(id: string): Game | undefined {
    return this.getAll().find((game) => game.id === id);
  }

  public update(game: Game): Game | null {
    return null;
  }

  public initGameFromJson(): void {
    this.http.get<Game>('assets/temp/initGame.json').subscribe({
      next: (game) => {
        const validationError = validateGame(game);
        if (validationError) {
          this.sendError(validationError);
        } else if (this.create(game)) {
          this.router.navigate(['game', game.id]);
        }
      },
      error: () => this.sendError('Ошибка при загрузке файла конфигураций!'),
    });
  }

  private checkIsGameExist(id: string): boolean {
    return this.getAll().some((game) => game.id === id);
  }

  private sendError(errorText: string): void {
    this.errorService.raise(errorText);
  }
}
