import { GameTemplate } from '../../_models/game-template';

export interface GameTemplateServiceInterface {
  create(template: GameTemplate): GameTemplate | null;
  delete(id: string): void;
  getAll(): GameTemplate[];
  getById(id: string): GameTemplate | undefined;
  getByName(name: string): GameTemplate | undefined;
}
