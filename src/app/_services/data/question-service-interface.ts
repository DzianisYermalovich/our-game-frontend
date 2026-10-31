import { Question } from '../../_models/question';

export interface QuestionServiceInterface {
  getQuestion(gameId: string, roundId: string, questionId: string): Question | undefined;
  updateQuestion(gameId: string, roundId: string, question: Question): void;
}
