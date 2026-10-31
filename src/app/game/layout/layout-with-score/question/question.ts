import { Component, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionService } from '../../../../_services/data/local-storage/question.service';
import { Question } from '../../../../_models/question';
import { QuestionState } from '../../../../_enums/question-state.enum';
import { QuestionTypes } from '../../../../_enums/question-types.enum';
import { PlayerService } from '../../../../_services/data/local-storage/player.service';
import { User } from '../../../../_models/user';
import { LayoutWithScore } from '../layout-with-score';

@Component({
  selector: 'app-question',
  imports: [LayoutWithScore, ReactiveFormsModule],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class QuestionComponent implements OnDestroy {
  protected readonly QuestionState = QuestionState;
  protected readonly QuestionTypes = QuestionTypes;

  private readonly route = inject(ActivatedRoute);
  private readonly questionService = inject(QuestionService);
  private readonly playerService = inject(PlayerService);
  private readonly router = inject(Router);

  public readonly gameId = this.route.snapshot.paramMap.get('gameId') ?? '';
  public readonly roundId = this.route.snapshot.paramMap.get('roundId') ?? '';
  public readonly questionId = this.route.snapshot.paramMap.get('questionId') ?? '';

  public question: Question | undefined = this.questionService.getQuestion(
    this.gameId,
    this.roundId,
    this.questionId,
  );
  public state: QuestionState | undefined;
  public players: User[] = this.playerService.getPlayersByGameId(this.gameId);
  public answeredUsersMap = new Map<string, boolean>();
  public formGroup = new FormGroup<Record<string, FormControl<string | null>>>({});

  private audio: HTMLAudioElement | null = new Audio();

  constructor() {
    for (const player of this.players) {
      this.answeredUsersMap.set(player.id, false);
      this.formGroup.addControl(player.id, new FormControl());
    }
    this.checkState();
  }

  public showTopic(): void {
    if (this.question?.topic) {
      this.state = QuestionState.TOPIC;
    } else {
      this.showQuestion();
    }
  }

  public showQuestion(): void {
    this.state = QuestionState.QUESTION;
    if (this.question?.type !== QuestionTypes.SUPER && this.audio) {
      this.audio.src = '/assets/sounds/system/NoAnswer.mp3';
      setTimeout(() => this.audio?.play(), 60 * 1000);
    }
  }

  public showAnswer(): void {
    if (!this.question) {
      return;
    }
    this.audio = null;
    this.question.isAnswered = true;
    this.questionService.updateQuestion(this.gameId, this.roundId, this.question);
    this.state = QuestionState.ANSWER;
  }

  public updateScore(userId: string, isRight: boolean): void {
    let price = this.questionService.countQuestionValue(this.gameId, this.roundId, this.questionId) ?? 0;
    const customPrice = +(this.formGroup.controls[userId]?.value ?? '');
    if (customPrice) {
      price = customPrice;
    }
    if (!isRight) {
      price = price * -1;
    }
    this.answeredUsersMap.set(userId, true);
    this.playerService.updateScore(this.gameId, userId, price);
  }

  public goToQuestions(): void {
    this.router.navigate(['game', this.gameId, 'round', this.roundId]);
  }

  private checkState(): void {
    if (!this.question) {
      return;
    }
    if (this.question.type === QuestionTypes.AUCTION || this.question.type === QuestionTypes.CAT) {
      this.state = QuestionState.TYPE;
    } else if (this.question.isAnswered) {
      this.showAnswer();
    } else {
      this.showQuestion();
    }
  }

  ngOnDestroy(): void {
    this.audio = null;
  }
}
