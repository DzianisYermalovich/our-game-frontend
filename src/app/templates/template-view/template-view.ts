import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameTemplate } from '../../_models/game-template';
import { Question } from '../../_models/question';
import { GameTemplateService } from '../../_services/data/local-storage/game-template.service';
import { Layout } from '../../game/layout/layout';
import { MediaImage } from '../../game/layout/layout-with-score/question/media/media-image';
import { MediaAudio } from '../../game/layout/layout-with-score/question/media/media-audio';

/**
 * The read-only template view (spec §5): the game as it is today, minus
 * scoring, stakes and splash sounds — round list → topic×price grid →
 * question with media, the answer visible immediately. The sidebar is
 * edit-ready: in-app template editing would bolt on here (out of scope,
 * external edit + re-import stays the authoring path). Media components
 * are reused from the play stack — the storage seam is id-agnostic, so
 * they resolve refs under the template id.
 */
type View = 'rounds' | 'grid' | 'super' | 'question';

@Component({
  selector: 'app-template-view',
  imports: [Layout, MediaImage, MediaAudio],
  templateUrl: './template-view.html',
  styleUrl: './template-view.scss',
})
export class TemplateView {
  private readonly templateService = inject(GameTemplateService);
  private readonly router = inject(Router);

  protected readonly templateId = inject(ActivatedRoute).snapshot.paramMap.get('templateId') ?? '';
  protected readonly template: GameTemplate | undefined;

  protected readonly view = signal<View>('rounds');
  protected readonly roundIndex = signal(0);
  protected readonly question = signal<Question | null>(null);
  private readonly fromSuper = signal(false);

  constructor() {
    this.template = this.templateService.getById(this.templateId);
    if (!this.template) {
      // Unknown id (deleted template, stale link): back to the library.
      void this.router.navigate(['templates']);
    }
  }

  protected readonly currentRound = computed(
    () => this.template?.rounds[this.roundIndex()] ?? null,
  );

  protected openRound(index: number): void {
    this.roundIndex.set(index);
    this.view.set('grid');
  }

  protected openSuper(): void {
    this.fromSuper.set(false);
    this.view.set('super');
  }

  protected openQuestion(question: Question): void {
    this.question.set(question);
    this.view.set('question');
  }

  protected openSuperQuestion(question: Question): void {
    this.fromSuper.set(true);
    this.question.set(question);
    this.view.set('question');
  }

  protected backToQuestions(): void {
    this.question.set(null);
    this.view.set(this.fromSuper() ? 'super' : 'grid');
  }

  protected backToRounds(): void {
    this.question.set(null);
    this.fromSuper.set(false);
    this.view.set('rounds');
  }

  protected toTemplates(): void {
    void this.router.navigate(['templates']);
  }

  /** The price play shows for the same cell: minPrice × position (spec §7). */
  protected priceFor(roundPosition: number, questionPosition: number): number {
    const minPrice = this.template?.settings.minPrice ?? 0;
    return minPrice * (questionPosition + 1) * (roundPosition + 1);
  }
}
