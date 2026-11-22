import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameTemplateService } from '../_services/data/local-storage/game-template.service';
import { GameImportService } from '../_services/import/game-import.service';
import { GameTemplateExportService } from '../_services/export/game-template-export.service';
import { MEDIA_STORAGE } from '../_services/media/media-storage';
import { GameTemplate } from '../_models/game-template';
import { Layout } from '../game/layout/layout';

@Component({
  selector: 'app-templates',
  imports: [Layout],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates {
  private readonly templateService = inject(GameTemplateService);
  private readonly importService = inject(GameImportService);
  private readonly exportService = inject(GameTemplateExportService);
  private readonly mediaStorage = inject(MEDIA_STORAGE);
  private readonly router = inject(Router);

  public readonly templates = signal<GameTemplate[]>(this.templateService.getAll());

  public onPackSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pack = input.files?.[0];
    input.value = ''; // let the same pack be re-picked after a failed import
    if (!pack) {
      return;
    }
    void this.importService.importPack(pack).then(() => this.refresh());
  }

  public openTemplate(templateId: string): void {
    this.router.navigate(['templates', templateId]);
  }

  public exportTemplate(template: GameTemplate): void {
    void this.exportService.exportTemplate(template);
  }

  public deleteTemplate(templateId: string): void {
    this.templateService.delete(templateId);
    // Media dies with its template (spec §2): drop the folder best-effort.
    // The cascade to games arrives with ticket 11 — no instances exist yet.
    void this.mediaStorage.deleteAll(templateId).catch(() => {});
    this.refresh();
  }

  public countQuestions(template: GameTemplate): number {
    const roundQuestions = template.rounds.reduce(
      (total, round) => total + round.topics.reduce((sum, topic) => sum + topic.questions.length, 0),
      0,
    );
    const superQuestions = template.superRound?.questions.length ?? 0;
    return roundQuestions + superQuestions;
  }

  private refresh(): void {
    this.templates.set(this.templateService.getAll());
  }
}
