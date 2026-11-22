import { Injectable, inject } from '@angular/core';
import { GameTemplate } from '../../../_models/game-template';
import { BalloonErrorService } from '../../errors/balloon-error.service';
import { GameTemplateServiceInterface } from '../game-template-service-interface';
import { generateUuid } from '../../../_utils/uuid';

const GAME_TEMPLATES_KEY = 'game-templates';

@Injectable({
  providedIn: 'root',
})
export class GameTemplateService implements GameTemplateServiceInterface {
  private readonly errorService = inject(BalloonErrorService);

  public create(template: GameTemplate): GameTemplate | null {
    if (this.getByName(template.name)) {
      this.sendError(`Шаблон игры с названием «${template.name}» уже существует`);
      return null;
    }
    const templates = this.getAll();
    const stored = template.id ? template : { ...template, id: generateUuid() };
    templates.push(stored);
    localStorage.setItem(GAME_TEMPLATES_KEY, JSON.stringify(templates));
    return stored;
  }

  public delete(id: string): void {
    const templates = this.getAll();
    const templateIndex = templates.findIndex((item) => item.id === id);
    if (templateIndex !== -1) {
      templates.splice(templateIndex, 1);
      localStorage.setItem(GAME_TEMPLATES_KEY, JSON.stringify(templates));
    }
  }

  public getAll(): GameTemplate[] {
    const templates = JSON.parse(localStorage.getItem(GAME_TEMPLATES_KEY) ?? '[]') as GameTemplate[];
    return templates ?? [];
  }

  public getById(id: string): GameTemplate | undefined {
    return this.getAll().find((template) => template.id === id);
  }

  public getByName(name: string): GameTemplate | undefined {
    return this.getAll().find((template) => this.normalizeName(template.name) === this.normalizeName(name));
  }

  /** Name identity (ADR 0004): compare trimmed + case-insensitively, store verbatim. */
  private normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  private sendError(errorText: string): void {
    this.errorService.raise(errorText);
  }
}
