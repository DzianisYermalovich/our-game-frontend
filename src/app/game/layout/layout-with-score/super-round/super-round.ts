import { Component, inject } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperRound } from '../../../../_models/super-round';
import { RoundService } from '../../../../_services/data/local-storage/round.service';
import { LayoutWithScore } from '../layout-with-score';

@Component({
  selector: 'app-super-round',
  imports: [LayoutWithScore, NgStyle, NgClass],
  templateUrl: './super-round.html',
  styleUrl: './super-round.scss',
})
export class SuperRoundComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly roundService = inject(RoundService);
  private readonly router = inject(Router);

  public readonly gameId = this.route.snapshot.paramMap.get('gameId') ?? '';
  public readonly superRound: SuperRound | undefined =
    this.roundService.getSuperRound(this.gameId);
  public readonly hideQuestionMap = new Map<string, boolean>();

  constructor() {
    // At least one question must stay clickable; the last one navigates instead of hiding.
    for (const question of this.superRound?.questions ?? []) {
      this.hideQuestionMap.set(question.id, false);
    }
  }

  public goToQuestion(gameId: string, questionId: string): void {
    let counter = 0;
    for (const question of this.superRound?.questions ?? []) {
      if (!this.hideQuestionMap.get(question.id)) {
        counter++;
      }
      if (counter > 1) {
        this.hideQuestionMap.set(questionId, true);
        return;
      }
    }
    this.router.navigate(['game', gameId, 'round', 'super', 'question', questionId]);
  }
}
