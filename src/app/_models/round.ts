import { Topic } from './topic';

export interface Round {
  id: string;
  name: string;
  topics: Topic[];
}
