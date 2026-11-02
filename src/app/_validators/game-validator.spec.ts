import { validateGame } from './game-validator';
import { makeValidGame } from '../../testing/game-fixture';

describe('validateGame', () => {
  it('accepts a valid Game', () => {
    expect(validateGame(makeValidGame())).toBeNull();
  });

  it('rejects a Game whose rounds count mismatches settings', () => {
    const game = makeValidGame();
    game.rounds = [];
    expect(validateGame(game)).toBe('Неправильное колличство раундов в файле-конфигурации');
  });

  it('rejects a Game whose topics count mismatches settings, naming the round', () => {
    const game = makeValidGame();
    game.rounds[0].topics = [];
    expect(validateGame(game)).toBe(
      'Неправильное колличство тем в раунде r1 у файла-конфигурации',
    );
  });

  it('rejects a Game whose questions count mismatches settings, naming the topic', () => {
    const game = makeValidGame();
    game.rounds[0].topics[0].questions = [];
    expect(validateGame(game)).toBe(
      'Неправильное колличство вопросов в теме t1 у файла-конфигурации',
    );
  });

  it('rejects a Game whose super-round questions count mismatches settings', () => {
    const game = makeValidGame();
    game.superRound.questions = [];
    expect(validateGame(game)).toBe(
      'Неправильное колличство вопросов в супер раунде у файла-конфигурации',
    );
  });

  it('rejects a Game whose minPrice is zero', () => {
    const game = makeValidGame();
    game.settings.minPrice = 0;
    expect(validateGame(game)).toBe(
      'Не указана минимальная стоимость в настройках у файла-конфигурации',
    );
  });

  it('rejects a Game whose id is not a string', () => {
    const game = Object.assign(makeValidGame(), { id: 42 });
    expect(validateGame(game)).toBe('Неправильный идентификатор игры в файле-конфигурации');
  });

  it('rejects a Game whose name is not a string', () => {
    const game = Object.assign(makeValidGame(), { name: null });
    expect(validateGame(game)).toBe('Неправильное название игры в файле-конфигурации');
  });

  it('rejects a Game whose author is not an object', () => {
    const game = Object.assign(makeValidGame(), { author: 'Denis' });
    expect(validateGame(game)).toBe('Неправильный автор игры в файле-конфигурации');
  });

  it('rejects a Game whose players are not an array', () => {
    const game = Object.assign(makeValidGame(), { players: 'Denis' });
    expect(validateGame(game)).toBe('Неправильный список игроков в файле-конфигурации');
  });

  it('rejects a Game whose rounds are not an array', () => {
    const game = Object.assign(makeValidGame(), { rounds: 'rounds' });
    expect(validateGame(game)).toBe('Неправильный список раундов в файле-конфигурации');
  });

  it('rejects a Game whose settings are missing instead of throwing', () => {
    const game = Object.assign(makeValidGame(), { settings: undefined });
    expect(validateGame(game)).toBe('Неправильные настройки в файле-конфигурации');
  });

  it('rejects a Game whose images are not an array', () => {
    const game = Object.assign(makeValidGame(), { images: 'logo.png' });
    expect(validateGame(game)).toBe('Неправильный список изображений игры в файле-конфигурации');
  });

  it('rejects a question whose text is not a string, naming the offender', () => {
    const game = makeValidGame();
    Object.assign(game.rounds[0].topics[0].questions[0], { text: null });
    expect(validateGame(game)).toBe(
      'Неправильный текст вопроса q1 в теме t1 раунда r1 в файле-конфигурации',
    );
  });

  it('rejects a question whose answer is not a string, naming the offender', () => {
    const game = makeValidGame();
    Object.assign(game.rounds[0].topics[0].questions[1], { answer: 5 });
    expect(validateGame(game)).toBe(
      'Неправильный ответ вопроса q2 в теме t1 раунда r1 в файле-конфигурации',
    );
  });

  it('rejects a question whose type is unknown, naming the offender', () => {
    const game = makeValidGame();
    Object.assign(game.rounds[0].topics[0].questions[0], { type: 'MYSTERY' });
    expect(validateGame(game)).toBe(
      'Неизвестный тип вопроса q1 в теме t1 раунда r1 в файле-конфигурации',
    );
  });

  it('rejects a super-round question whose type is unknown, naming the super round', () => {
    const game = makeValidGame();
    Object.assign(game.superRound.questions[0], { type: 'MYSTERY' });
    expect(validateGame(game)).toBe(
      'Неизвестный тип вопроса sq1 в супер раунде в файле-конфигурации',
    );
  });

  it('rejects a super-round question whose text is not a string, naming the super round', () => {
    const game = makeValidGame();
    Object.assign(game.superRound.questions[0], { text: null });
    expect(validateGame(game)).toBe(
      'Неправильный текст вопроса sq1 в супер раунде в файле-конфигурации',
    );
  });

  it('rejects a super-round question whose answer is not a string, naming the super round', () => {
    const game = makeValidGame();
    Object.assign(game.superRound.questions[0], { answer: 7 });
    expect(validateGame(game)).toBe(
      'Неправильный ответ вопроса sq1 в супер раунде в файле-конфигурации',
    );
  });

  it('rejects a null round instead of throwing', () => {
    const game = makeValidGame();
    Object.assign(game, { rounds: [null] });
    expect(validateGame(game)).toBe('Неправильный раунд в файле-конфигурации');
  });

  it('rejects a null topic instead of throwing, naming the round', () => {
    const game = makeValidGame();
    Object.assign(game.rounds[0], { topics: [null] });
    expect(validateGame(game)).toBe('Неправильная тема в раунде r1 в файле-конфигурации');
  });

  it('rejects a null question instead of throwing, naming the topic and round', () => {
    const game = makeValidGame();
    Object.assign(game.rounds[0].topics[0], { questions: [null] });
    expect(validateGame(game)).toBe(
      'Неправильный вопрос в теме t1 раунда r1 в файле-конфигурации',
    );
  });

  it('rejects a truthy non-object superRound instead of throwing', () => {
    const game = Object.assign(makeValidGame(), { superRound: 'super' });
    expect(validateGame(game)).toBe('Неправильный супер раунд в файле-конфигурации');
  });

  it('rejects a superRound whose questions are not an array instead of throwing', () => {
    const game = makeValidGame();
    Object.assign(game.superRound, { questions: undefined });
    expect(validateGame(game)).toBe(
      'Неправильный список вопросов супер раунда в файле-конфигурации',
    );
  });

  it('rejects a missing superRound via the structural count check', () => {
    const game = Object.assign(makeValidGame(), { superRound: undefined });
    expect(validateGame(game)).toBe(
      'Неправильное колличство вопросов в супер раунде у файла-конфигурации',
    );
  });
});
