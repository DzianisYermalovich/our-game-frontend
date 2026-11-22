import { validateGameTemplate } from './game-template-validator';
import { makeGameTemplate } from '../../testing/game-fixture';
import { GameTemplate } from '../_models/game-template';

describe('validateGameTemplate', () => {
  it('accepts a valid GameTemplate', () => {
    expect(validateGameTemplate(makeGameTemplate())).toBeNull();
  });

  it('never checks the pack id — ids are ignored at import', () => {
    const template = Object.assign(makeGameTemplate(), { id: 42 });
    expect(validateGameTemplate(template)).toBeNull();
  });

  it('never checks players — the roster is tolerated and ignored', () => {
    const template = Object.assign(makeGameTemplate(), { players: 'Denis' });
    expect(validateGameTemplate(template)).toBeNull();
  });

  it('rejects a template whose rounds count mismatches settings', () => {
    const template = makeGameTemplate();
    template.rounds = [];
    expect(validateGameTemplate(template)).toBe(
      'Неправильное количество раундов в файле-конфигурации',
    );
  });

  it('rejects a template whose topics count mismatches settings, naming the round by index', () => {
    const template = makeGameTemplate();
    template.rounds[0].topics = [];
    expect(validateGameTemplate(template)).toBe(
      'Неправильное количество тем в раунде 1 у файла-конфигурации',
    );
  });

  it('rejects a template whose questions count mismatches settings, naming the topic by index', () => {
    const template = makeGameTemplate();
    template.rounds[0].topics[0].questions = [];
    expect(validateGameTemplate(template)).toBe(
      'Неправильное количество вопросов в теме 1 у файла-конфигурации',
    );
  });

  it('rejects a template whose super-round questions count mismatches settings', () => {
    const template = makeGameTemplate();
    template.superRound.questions = [];
    expect(validateGameTemplate(template)).toBe(
      'Неправильное количество вопросов в супер раунде у файла-конфигурации',
    );
  });

  it('rejects a template whose minPrice is zero', () => {
    const template = makeGameTemplate();
    template.settings.minPrice = 0;
    expect(validateGameTemplate(template)).toBe(
      'Не указана минимальная стоимость в настройках у файла-конфигурации',
    );
  });

  it('rejects a template whose name is not a string, naming the template', () => {
    const template = Object.assign(makeGameTemplate(), { name: null });
    expect(validateGameTemplate(template)).toBe(
      'Неправильное название шаблона игры в файле-конфигурации',
    );
  });

  it('rejects a template whose author is not an object, naming the template', () => {
    const template = Object.assign(makeGameTemplate(), { author: 'Denis' });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный автор шаблона игры в файле-конфигурации',
    );
  });

  it('rejects a template whose rounds are not an array', () => {
    const template = Object.assign(makeGameTemplate(), { rounds: 'rounds' });
    expect(validateGameTemplate(template)).toBe('Неправильный список раундов в файле-конфигурации');
  });

  it('rejects a template whose settings are missing instead of throwing', () => {
    const template = Object.assign(makeGameTemplate(), { settings: undefined });
    expect(validateGameTemplate(template)).toBe('Неправильные настройки в файле-конфигурации');
  });

  it('rejects a template whose images are not an array, naming the template', () => {
    const template = Object.assign(makeGameTemplate(), { images: 'logo.png' });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный список изображений шаблона игры в файле-конфигурации',
    );
  });

  it('rejects a question whose text is not a string, citing 1-based indexes', () => {
    const template = makeGameTemplate();
    Object.assign(template.rounds[0].topics[0].questions[0], { text: null });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный текст вопроса 1 в теме 1 раунда 1 в файле-конфигурации',
    );
  });

  it('rejects a question whose answer is not a string, citing 1-based indexes', () => {
    const template = makeGameTemplate();
    Object.assign(template.rounds[0].topics[0].questions[1], { answer: 5 });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный ответ вопроса 2 в теме 1 раунда 1 в файле-конфигурации',
    );
  });

  it('rejects a question whose type is unknown, citing 1-based indexes', () => {
    const template = makeGameTemplate();
    Object.assign(template.rounds[0].topics[0].questions[0], { type: 'MYSTERY' });
    expect(validateGameTemplate(template)).toBe(
      'Неизвестный тип вопроса 1 в теме 1 раунда 1 в файле-конфигурации',
    );
  });

  it('rejects a super-round question whose type is unknown, naming the super round', () => {
    const template = makeGameTemplate();
    Object.assign(template.superRound.questions[0], { type: 'MYSTERY' });
    expect(validateGameTemplate(template)).toBe(
      'Неизвестный тип вопроса 1 в супер раунде в файле-конфигурации',
    );
  });

  it('rejects a super-round question whose text is not a string, naming the super round', () => {
    const template = makeGameTemplate();
    Object.assign(template.superRound.questions[0], { text: null });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный текст вопроса 1 в супер раунде в файле-конфигурации',
    );
  });

  it('rejects a null round instead of throwing', () => {
    const template = makeGameTemplate();
    Object.assign(template, { rounds: [null] });
    expect(validateGameTemplate(template)).toBe('Неправильный раунд в файле-конфигурации');
  });

  it('rejects a null topic instead of throwing, naming the round by index', () => {
    const template = makeGameTemplate();
    Object.assign(template.rounds[0], { topics: [null] });
    expect(validateGameTemplate(template)).toBe(
      'Неправильная тема в раунде 1 в файле-конфигурации',
    );
  });

  it('rejects a null question instead of throwing, citing indexes', () => {
    const template = makeGameTemplate();
    Object.assign(template.rounds[0].topics[0], { questions: [null] });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный вопрос 1 в теме 1 раунда 1 в файле-конфигурации',
    );
  });

  it('rejects a truthy non-object superRound instead of throwing', () => {
    const template = Object.assign(makeGameTemplate(), { superRound: 'super' });
    expect(validateGameTemplate(template)).toBe('Неправильный супер раунд в файле-конфигурации');
  });

  it('rejects a superRound whose questions are not an array instead of throwing', () => {
    const template = makeGameTemplate();
    Object.assign(template.superRound, { questions: undefined });
    expect(validateGameTemplate(template)).toBe(
      'Неправильный список вопросов супер раунда в файле-конфигурации',
    );
  });

  it('rejects a missing superRound via the structural count check', () => {
    const template = Object.assign(makeGameTemplate(), { superRound: undefined });
    expect(validateGameTemplate(template)).toBe(
      'Неправильное количество вопросов в супер раунде у файла-конфигурации',
    );
  });

  it('validates a template with media refs unchanged (refs are not paths checked here)', () => {
    const template: GameTemplate = makeGameTemplate();
    template.images = ['a.png'];
    template.rounds[0].topics[0].questions[0].image = ['media/b.png'];
    template.rounds[0].topics[0].questions[0].sound = 'media/c.mp3';
    template.superRound.questions[0].answerImage = 'd.png';
    expect(validateGameTemplate(template)).toBeNull();
  });
});
