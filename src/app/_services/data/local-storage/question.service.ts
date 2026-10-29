import { Injectable, inject } from '@angular/core';
import { Question } from '../../../_models/question';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly gameService = inject(GameService);

  public getQuestion(gameId: string, roundId: string, questionId: string): Question | undefined {
    const game = this.gameService.getById(gameId);
    if (!game) {
      return undefined;
    }
    if (roundId === 'super') {
      return game.superRound.questions.find((question) => question.id === questionId);
    }
    const round = game.rounds.find((item) => item.id === roundId);
    if (!round) {
      return undefined;
    }
    for (const topic of round.topics) {
      const question = topic.questions.find((item) => item.id === questionId);
      if (question) {
        return question;
      }
    }
    return undefined;
  }

  public countQuestionValue(gameId: string, roundId: string, questionId: string): number | null {
    const game = this.gameService.getById(gameId);
    if (!game) {
      return null;
    }
    for (let roundNumber = 0; roundNumber < game.rounds.length; roundNumber++) {
      const round = game.rounds[roundNumber];
      if (round.id === roundId) {
        for (let topicNumber = 0; topicNumber < round.topics.length; topicNumber++) {
          const topic = round.topics[topicNumber];
          for (let questionNumber = 0; questionNumber < topic.questions.length; questionNumber++) {
            const question = topic.questions[questionNumber];
            if (question.id === questionId) {
              return game.settings.minPrice * (questionNumber + 1) * (roundNumber + 1);
            }
          }
        }
      }
    }
    return null;
  }

  public updateQuestion(gameId: string, roundId: string, question: Question): void {
    const games = this.gameService.getAll();
    const game = games.find((item) => item.id === gameId);
    if (!game) {
      return;
    }
    if (roundId === 'super') {
      const questionIndex = game.superRound.questions.findIndex((item) => item.id === question.id);
      if (questionIndex !== -1) {
        game.superRound.questions[questionIndex] = question;
      }
    } else {
      const round = game.rounds.find((item) => item.id === roundId);
      if (!round) {
        return;
      }
      let topicIndex = -1;
      for (let i = 0; i < round.topics.length; i++) {
        if (round.topics[i].questions.some((item) => item.id === question.id)) {
          topicIndex = i;
        }
      }
      if (topicIndex === -1) {
        return;
      }
      const questionIndex = round.topics[topicIndex].questions.findIndex(
        (item) => item.id === question.id,
      );
      if (questionIndex !== -1) {
        round.topics[topicIndex].questions[questionIndex] = question;
      }
    }
    localStorage.setItem('games', JSON.stringify(games));
  }
}
