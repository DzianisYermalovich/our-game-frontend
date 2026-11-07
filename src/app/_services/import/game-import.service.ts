import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { unzipSync } from 'fflate';
import { Game } from '../../_models/game';
import { Question } from '../../_models/question';
import { GameService } from '../data/local-storage/game.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { validateGame } from '../../_validators/game-validator';

/**
 * Imports a Game pack from a user-selected zip file (spec §2–§4, ADR 0003).
 * Pipeline: unzip → find the single root-level `.json` → parse → validate
 * (structure, fields, media refs) → create Game → navigate to it.
 * Every failure surfaces as a BalloonError in Russian; nothing is stored
 * unless the whole pack is valid.
 */
@Service()
export class GameImportService {
  private readonly gameService = inject(GameService);
  private readonly errorService = inject(BalloonErrorService);
  private readonly router = inject(Router);

  public async importPack(pack: File): Promise<void> {
    let entries: Record<string, Uint8Array>;
    try {
      entries = unzipSync(new Uint8Array(await pack.arrayBuffer()));
    } catch {
      this.sendError('Не удалось распаковать архив с игрой');
      return;
    }

    const configNames = Object.keys(entries).filter(
      (name) => !name.includes('/') && name.toLowerCase().endsWith('.json'),
    );
    if (configNames.length !== 1) {
      this.sendError(
        `В корне архива должен быть ровно один файл-конфигурация .json, найдено: ${configNames.length}`,
      );
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(new TextDecoder().decode(entries[configNames[0]]));
    } catch {
      this.sendError('Не удалось разобрать JSON в файле-конфигурации');
      return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      this.sendError('Неправильная структура файла-конфигурации');
      return;
    }
    const game = parsed as Game;

    const validationError = validateGame(game);
    if (validationError) {
      this.sendError(validationError);
      return;
    }

    const mediaError = checkMediaRefs(game, new Set(Object.keys(entries)));
    if (mediaError) {
      this.sendError(mediaError);
      return;
    }

    // create() raises the verbatim id-clash balloon itself and returns null,
    // leaving storage untouched.
    if (this.gameService.create(game)) {
      this.router.navigate(['game', game.id]);
    }
  }

  private sendError(errorText: string): void {
    this.errorService.raise(errorText);
  }
}

/** Collects every zip-root-relative media ref the Game points at. */
function collectMediaRefs(game: Game): string[] {
  const refs: string[] = [...(game.images ?? [])];
  const questions: Question[] = game.rounds.flatMap((round) =>
    round.topics.flatMap((topic) => topic.questions),
  );
  if (game.superRound) {
    questions.push(...game.superRound.questions);
  }
  for (const question of questions) {
    refs.push(...(question.image ?? []), question.sound ?? '', question.answerImage ?? '');
  }
  return refs.filter((ref) => ref !== '');
}

/**
 * True when the ref points outside the zip root: absolute (`/x.png`,
 * `C:\x.png`) or climbing out (`../x.png`). Backslash is treated as a
 * separator so Windows-style refs are checked the same way.
 */
function escapesZipRoot(ref: string): boolean {
  if (ref.startsWith('/') || ref.startsWith('\\')) {
    return true;
  }
  if (/^[a-zA-Z]:/.test(ref)) {
    return true;
  }
  return ref.split(/[\\/]/).includes('..');
}

/**
 * Media layer (spec §3): every media ref must resolve to a file inside the
 * zip. Returns null when all refs resolve, otherwise the BalloonError message.
 */
function checkMediaRefs(game: Game, zipNames: Set<string>): string | null {
  const refs = collectMediaRefs(game);
  const escaping = [...new Set(refs.filter((ref) => escapesZipRoot(ref)))];
  if (escaping.length > 0) {
    return `Пути выходят за пределы архива: ${escaping.join(', ')}`;
  }
  const missing = [...new Set(refs.filter((ref) => !zipNames.has(ref)))];
  if (missing.length > 0) {
    return `Отсутствуют файлы в архиве: ${missing.join(', ')}`;
  }
  return null;
}
