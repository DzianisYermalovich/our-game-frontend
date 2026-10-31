import { Injectable, inject } from '@angular/core';
import { Round } from '../../../_models/round';
import { SuperRound } from '../../../_models/super-round';
import { GameService } from './game.service';
import { RoundServiceInterface } from '../round-service-interface';

@Injectable({
  providedIn: 'root',
})
export class RoundService implements RoundServiceInterface {
  private readonly gameService = inject(GameService);

  public getRound(gameId: string, roundId: string): Round | undefined {
    return this.gameService.getById(gameId)?.rounds.find((round) => round.id === roundId);
  }

  public getSuperRound(gameId: string): SuperRound | undefined {
    return this.gameService.getById(gameId)?.superRound;
  }
}
