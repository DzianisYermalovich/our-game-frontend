import { Round } from '../../_models/round';
import { SuperRound } from '../../_models/super-round';

export interface RoundServiceInterface {
  getRound(gameId: string, roundId: string): Round | undefined;
  getSuperRound(gameId: string): SuperRound | undefined;
}
