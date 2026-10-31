import { User } from '../../_models/user';

export interface PlayerServiceInterface {
  getPlayersByGameId(gameId: string): User[];
  updateScore(gameId: string, userId: string, price: number): void;
}
