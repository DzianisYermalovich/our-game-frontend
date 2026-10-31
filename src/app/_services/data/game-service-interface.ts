import { Game } from '../../_models/game';

export interface GameServiceInterface {
  create(game: Game): Game | null;
  delete(id: string): void;
  getAll(): Game[];
  getById(id: string): Game | undefined;
  update(game: Game): Game | null;
}
