import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../../_services/data/local-storage/game.service';
import { Game } from '../../../../_models/game';
import { LayoutWithScore } from '../layout-with-score';

@Component({
  selector: 'app-game',
  imports: [LayoutWithScore],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class GameComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);

  public readonly game: Game | undefined = this.gameService.getById(
    this.route.snapshot.paramMap.get('gameId') ?? '',
  );

  public toRound(gameId: string, roundId: string): void {
    this.router.navigate(['game', gameId, 'round', roundId]);
  }

  public toSuperRound(gameId: string): void {
    this.router.navigate(['game', gameId, 'round', 'super']);
  }
}
