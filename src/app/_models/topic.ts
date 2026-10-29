import { Question } from './question';

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}
