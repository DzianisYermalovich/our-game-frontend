import { User } from './user';
import { Round } from './round';
import { SuperRound } from './super-round';
import { GameSettings } from './game-settings';

/**
 * Importable quiz content a Game is created from — no roster, no state
 * (GLOSSARY: GameTemplate). Ids are nullable only because packs can't be
 * trusted; at rest every id is a generated uuid.
 */
export interface GameTemplate {
  id?: string;
  name: string;
  author: User;
  rounds: Round[];
  superRound: SuperRound;
  settings: GameSettings;
  /** Template-level media refs, optional: present only on imported packs. */
  images?: string[];
}
