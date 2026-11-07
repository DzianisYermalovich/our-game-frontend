import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Unzipped, unzipSync } from 'fflate';
import { Game } from '../../_models/game';
import { GameService } from '../data/local-storage/game.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { validateGame } from '../../_validators/game-validator';
import { MEDIA_STORAGE } from '../media/media-storage';
import { checkMediaRefs, collectMediaRefs } from '../media/media-refs';

/**
 * Imports a Game pack from a user-selected zip file (spec §2–§5, ADR 0003).
 * Pipeline: unzip → find the single root-level `.json` → parse → validate
 * (structure, fields, media refs) → id-clash pre-check → store media →
 * create Game → navigate to it.
 * Every failure surfaces as a BalloonError in Russian. The clash pre-check
 * runs before any media byte is written, so a reject has nothing to roll
 * back; a failed media write rolls the whole Game back — media never
 * outlives its Game.
 */
@Service()
export class GameImportService {
  private readonly gameService = inject(GameService);
  private readonly errorService = inject(BalloonErrorService);
  private readonly mediaStorage = inject(MEDIA_STORAGE);
  private readonly router = inject(Router);
  private persistRequested = false;

  public async importPack(pack: File): Promise<void> {
    let entries: Unzipped;
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

    // Repeats GameService.create's verbatim reject, but before any media
    // byte is written — a clash reject has nothing to roll back.
    if (this.gameService.getById(game.id)) {
      this.sendError(`Игра с Id ${game.id} уже существует`);
      return;
    }

    try {
      await this.storeMedia(game, entries);
    } catch {
      // Atomic reject: no Game entry, no leftover media folder.
      await this.mediaStorage.deleteGame(game.id).catch(() => {});
      this.sendError(
        'Недостаточно места для сохранения игры. Удалите старые игры и попробуйте снова.',
      );
      return;
    }

    // create() re-checks the clash and raises the verbatim balloon itself.
    if (this.gameService.create(game)) {
      this.router.navigate(['game', game.id]);
      this.requestPersistence();
    }
  }

  /** Writes every media file the Game references, keyed by the author's ref. */
  private async storeMedia(game: Game, entries: Unzipped): Promise<void> {
    for (const ref of new Set(collectMediaRefs(game))) {
      await this.mediaStorage.put(game.id, ref, new Blob([entries[ref]]));
    }
  }

  /** Opts out of best-effort eviction once, after the first successful import. */
  private requestPersistence(): void {
    if (this.persistRequested) {
      return;
    }
    this.persistRequested = true;
    void navigator.storage?.persist?.().catch(() => {});
  }

  private sendError(errorText: string): void {
    this.errorService.raise(errorText);
  }
}
