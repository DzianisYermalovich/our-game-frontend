import { User } from './user';
import { Round } from './round';
import { SuperRound } from './super-round';
import { GameSettings } from './game-settings';

export interface Game {
  id: string;
  name: string;
  author: User;
  players: User[];
  rounds: Round[];
  superRound: SuperRound;
  settings: GameSettings;
}
