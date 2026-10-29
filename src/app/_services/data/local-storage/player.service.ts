import { Injectable, inject } from '@angular/core';
import { GameService } from './game.service';
import { User } from '../../../_models/user';
import { ScoreUpdateService } from '../../component-communication/score-update.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly gameService = inject(GameService);
  private readonly scoreUpdateService = inject(ScoreUpdateService);

  public getPlayersByGameId(gameId: string): User[] {
    return this.gameService.getById(gameId)?.players ?? [];
  }

  public updateScore(gameId: string, userId: string, price: number): void {
    const games = this.gameService.getAll();
    const game = games.find((item) => item.id === gameId);
    const player = game?.players.find((item) => item.id === userId);
    if (!player) {
      return;
    }
    player.score = (player.score ?? 0) + price;
    localStorage.setItem('games', JSON.stringify(games));
    this.scoreUpdateService.bump();
  }
}
