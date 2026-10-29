import { Game } from '../app/_models/game';
import { QuestionTypes } from '../app/_enums/question-types.enum';
import { Roles } from '../app/_enums/roles.enum';

/** A minimal Game that passes GameService.isGameValid. */
export function makeValidGame(id = '1'): Game {
  return {
    id,
    name: `TestGame ${id}`,
    author: { id: '0', name: 'Author', role: Roles.ADMIN },
    players: [
      { id: '2', name: 'Player 1', role: Roles.PLAYER },
      { id: '3', name: 'Player 2', role: Roles.PLAYER },
    ],
    rounds: [
      {
        id: 'r1',
        name: 'Round 1',
        topics: [
          {
            id: 't1',
            name: 'Topic 1',
            questions: [
              { id: 'q1', type: QuestionTypes.REGULAR, text: 'Q1', answer: 'A1' },
              { id: 'q2', type: QuestionTypes.AUCTION, text: 'Q2', answer: 'A2' },
            ],
          },
        ],
      },
    ],
    superRound: {
      id: 's1',
      questions: [
        { id: 'sq1', type: QuestionTypes.SUPER, topic: 'Super topic', text: 'SQ1', answer: 'SA1' },
      ],
    },
    settings: {
      id: 0,
      topicsInRound: 1,
      questionsInTopic: 2,
      superQuestions: 1,
      minPrice: 100,
      rounds: 1,
    },
  };
}
