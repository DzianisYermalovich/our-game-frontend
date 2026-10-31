import { Component, inject } from '@angular/core';
import { NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Round } from '../../../../_models/round';
import { RoundService } from '../../../../_services/data/local-storage/round.service';
import { QuestionService } from '../../../../_services/data/local-storage/question.service';
import { LayoutWithScore } from '../layout-with-score';

@Component({
  selector: 'app-round',
  imports: [LayoutWithScore, NgStyle],
  templateUrl: './round.html',
  styleUrl: './round.scss',
})
export class RoundComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly roundService = inject(RoundService);
  private readonly questionService = inject(QuestionService);
  private readonly router = inject(Router);

  public readonly gameId = this.route.snapshot.paramMap.get('gameId') ?? '';
  public readonly roundId = this.route.snapshot.paramMap.get('roundId') ?? '';
  public readonly round: Round | undefined = this.roundService.getRound(this.gameId, this.roundId);

  public getQuestionValue(questionId: string): number | null {
    return this.questionService.countQuestionValue(this.gameId, this.roundId, questionId);
  }

  public goToQuestion(gameId: string, roundId: string, questionId: string): void {
    this.router.navigate(['game', gameId, 'round', roundId, 'question', questionId]);
  }
}
