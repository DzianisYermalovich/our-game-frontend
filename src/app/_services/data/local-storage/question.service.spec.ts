import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuestionService } from './question.service';
import { GameService } from './game.service';
import { makeValidGame } from '../../../../testing/game-fixture';

describe('QuestionService', () => {
  let service: QuestionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    TestBed.inject(GameService).create(makeValidGame());
    service = TestBed.inject(QuestionService);
  });

  it('getQuestion() finds a regular question by round', () => {
    expect(service.getQuestion('1', 'r1', 'q1')?.text).toBe('Q1');
  });

  it('getQuestion() finds a super-round question via the "super" round id', () => {
    expect(service.getQuestion('1', 'super', 'sq1')?.text).toBe('SQ1');
  });

  it('getQuestion() returns undefined for an unknown question', () => {
    expect(service.getQuestion('1', 'r1', 'nope')).toBeUndefined();
  });

  it('countQuestionValue() scales the min price by topic column and round number', () => {
    expect(service.countQuestionValue('1', 'r1', 'q1')).toBe(100);
    expect(service.countQuestionValue('1', 'r1', 'q2')).toBe(200);
    expect(service.countQuestionValue('1', 'r1', 'nope')).toBeNull();
  });

  it('updateQuestion() marks the question answered and persists it', () => {
    const question = service.getQuestion('1', 'r1', 'q1');
    expect(question).toBeTruthy();
    service.updateQuestion('1', 'r1', { ...question!, isAnswered: true });
    expect(service.getQuestion('1', 'r1', 'q1')?.isAnswered).toBe(true);
  });

  it('updateQuestion() updates super-round questions', () => {
    const question = service.getQuestion('1', 'super', 'sq1');
    expect(question).toBeTruthy();
    service.updateQuestion('1', 'super', { ...question!, isAnswered: true });
    expect(service.getQuestion('1', 'super', 'sq1')?.isAnswered).toBe(true);
  });
});
