import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../../_services/data/local-storage/game.service';
import { Game } from '../../../_models/game';
import { Layout } from '../layout';

@Component({
  selector: 'app-game-list',
  imports: [Layout],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss',
})
export class GameList {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  public readonly games = signal<Game[]>(this.gameService.getAll());

  public continueGame(gameId: string): void {
    this.router.navigate(['game', gameId]);
  }

  public deleteGame(gameId: string): void {
    this.gameService.delete(gameId);
    this.games.set(this.gameService.getAll());
  }
}
