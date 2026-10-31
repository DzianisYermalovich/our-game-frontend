import { QuestionTypes } from '../_enums/question-types.enum';

export interface Question {
  id: string;
  type: QuestionTypes;
  topic?: string;
  text: string;
  answer: string;
  image?: string[];
  sound?: string;
  answerImage?: string;
  isAnswered?: boolean;
}
