import { Injectable, inject } from '@angular/core';
import { Game } from '../../../_models/game';
import { BalloonErrorService } from '../../errors/balloon-error.service';
import { GameServiceInterface } from '../game-service-interface';

const GAMES_KEY = 'games';

@Injectable({
  providedIn: 'root',
})
export class GameService implements GameServiceInterface {
  private readonly errorService = inject(BalloonErrorService);

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

  private checkIsGameExist(id: string): boolean {
    return this.getAll().some((game) => game.id === id);
  }

  private sendError(errorText: string): void {
    this.errorService.raise(errorText);
  }
}
