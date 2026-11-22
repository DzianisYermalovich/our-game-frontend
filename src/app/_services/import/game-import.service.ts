import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Unzipped, unzipSync } from 'fflate';
import { GameTemplate } from '../../_models/game-template';
import { Question } from '../../_models/question';
import { GameTemplateService } from '../data/local-storage/game-template.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { validateGameTemplate } from '../../_validators/game-template-validator';
import { MEDIA_STORAGE } from '../media/media-storage';
import { checkMediaRefs, collectMediaRefs } from '../media/media-refs';
import { generateUuid } from '../../_utils/uuid';

/**
 * Imports a user-selected pack zip as a read-only GameTemplate (spec §4,
 * ADR 0004). Pipeline: unzip → find the single root-level `.json` → parse →
 * validate → construct the GameTemplate (fresh uuids everywhere — the pack's
 * ids are never read; players and answered flags are dropped by construction)
 * → media-ref check → name-clash pre-check before any media byte (a reject
 * has nothing to roll back) → store media under the fresh template id →
 * create re-checks and raises the verbatim balloon → navigate to
 * /templates/:id. Every failure surfaces as a BalloonError in Russian; a
 * failed media write rolls the whole template back — media never outlives
 * its template.
 */
@Service()
export class GameImportService {
  private readonly templateService = inject(GameTemplateService);
  private readonly errorService = inject(BalloonErrorService);
  private readonly mediaStorage = inject(MEDIA_STORAGE);
  private readonly router = inject(Router);
  private persistRequested = false;

  public async importPack(pack: File): Promise<void> {
    let entries: Unzipped;
    try {
      entries = unzipSync(new Uint8Array(await pack.arrayBuffer()));
    } catch {
      this.sendError('Не удалось распаковать архив с шаблоном игры');
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
    const parsedPack = parsed as GameTemplate;

    // The validator runs on the parsed pack: it names problems in untrusted
    // input, and every field it blesses is carried verbatim into the stored
    // template — the fresh uuids written by buildTemplate are never checked.
    const validationError = validateGameTemplate(parsedPack);
    if (validationError) {
      this.sendError(validationError);
      return;
    }
    const template = buildTemplate(parsedPack);

    const mediaError = checkMediaRefs(template, new Set(Object.keys(entries)));
    if (mediaError) {
      this.sendError(mediaError);
      return;
    }

    // Repeats GameTemplateService.create's verbatim reject, but before any
    // media byte is written — a clash reject has nothing to roll back.
    if (this.templateService.getByName(template.name)) {
      this.sendError(`Шаблон игры с названием «${template.name}» уже существует`);
      return;
    }

    try {
      await this.storeMedia(template, entries);
    } catch {
      // Atomic reject: no template entry, no leftover media folder.
      await this.mediaStorage.deleteAll(template.id!).catch(() => {});
      this.sendError(
        'Недостаточно места для сохранения шаблона игры. Удалите старые шаблоны и попробуйте снова.',
      );
      return;
    }

    // create() re-checks the clash and raises the verbatim balloon itself.
    if (this.templateService.create(template)) {
      this.router.navigate(['templates', template.id]);
      this.requestPersistence();
    }
  }

  /** Writes every media file the template references, keyed by its ref. */
  private async storeMedia(template: GameTemplate, entries: Unzipped): Promise<void> {
    for (const ref of new Set(collectMediaRefs(template))) {
      await this.mediaStorage.put(template.id!, ref, new Blob([entries[ref]]));
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

/**
 * Builds the stored GameTemplate from the validated pack: fresh uuids for
 * the template, author, settings and every round/topic/question; the pack's
 * id fields and players list are never read, so roster and answered flags
 * are dropped by construction.
 */
function buildTemplate(pack: GameTemplate): GameTemplate {
  return {
    id: generateUuid(),
    name: pack.name,
    author: { ...pack.author, id: generateUuid() },
    rounds: pack.rounds.map((round) => ({
      id: generateUuid(),
      name: round.name,
      topics: round.topics.map((topic) => ({
        id: generateUuid(),
        name: topic.name,
        questions: topic.questions.map(buildQuestion),
      })),
    })),
    superRound: {
      id: generateUuid(),
      questions: (pack.superRound?.questions ?? []).map(buildQuestion),
    },
    settings: { ...pack.settings, id: generateUuid() },
    images: pack.images,
  };
}

function buildQuestion(question: Question): Question {
  return {
    id: generateUuid(),
    type: question.type,
    topic: question.topic,
    text: question.text,
    answer: question.answer,
    image: question.image,
    sound: question.sound,
    answerImage: question.answerImage,
  };
}
