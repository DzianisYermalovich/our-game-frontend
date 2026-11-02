import { Game } from '../_models/game';
import { Question } from '../_models/question';
import { QuestionTypes } from '../_enums/question-types.enum';

/**
 * Light checks for one Question. `where` names the question's location
 * (topic and round, or the super round) for the failure message.
 */
function checkQuestion(question: Question, where: string): string | null {
  if (typeof question.text !== 'string') {
    return `Неправильный текст вопроса ${question.id} ${where} в файле-конфигурации`;
  }
  if (typeof question.answer !== 'string') {
    return `Неправильный ответ вопроса ${question.id} ${where} в файле-конфигурации`;
  }
  if (!Object.values(QuestionTypes).includes(question.type)) {
    return `Неизвестный тип вопроса ${question.id} ${where} в файле-конфигурации`;
  }
  return null;
}

/**
 * Decides whether Game JSON is valid. Returns null when the Game is valid,
 * otherwise the BalloonError message describing the first problem found.
 * Raises nothing: the caller decides whether to surface the message.
 */
export function validateGame(game: Game): string | null {
  // Light field/type checks first, so ill-typed input cannot crash the
  // structural counts below.
  if (typeof game.id !== 'string') {
    return `Неправильный идентификатор игры в файле-конфигурации`;
  }
  if (typeof game.name !== 'string') {
    return `Неправильное название игры в файле-конфигурации`;
  }
  if (typeof game.author !== 'object' || game.author === null || Array.isArray(game.author)) {
    return `Неправильный автор игры в файле-конфигурации`;
  }
  if (!Array.isArray(game.players)) {
    return `Неправильный список игроков в файле-конфигурации`;
  }
  if (!Array.isArray(game.rounds)) {
    return `Неправильный список раундов в файле-конфигурации`;
  }
  if (
    typeof game.settings !== 'object' ||
    game.settings === null ||
    Array.isArray(game.settings)
  ) {
    return `Неправильные настройки в файле-конфигурации`;
  }
  if (game.images !== undefined && !Array.isArray(game.images)) {
    return `Неправильный список изображений игры в файле-конфигурации`;
  }
  for (const round of game.rounds) {
    if (typeof round !== 'object' || round === null || Array.isArray(round)) {
      return `Неправильный раунд в файле-конфигурации`;
    }
    if (!Array.isArray(round.topics)) {
      continue; // not iterable — the structural check below names the round
    }
    for (const topic of round.topics) {
      if (typeof topic !== 'object' || topic === null || Array.isArray(topic)) {
        return `Неправильная тема в раунде ${round.id} в файле-конфигурации`;
      }
      if (!Array.isArray(topic.questions)) {
        continue; // not iterable — the structural check below names the topic
      }
      for (const question of topic.questions) {
        if (
          typeof question !== 'object' ||
          question === null ||
          Array.isArray(question)
        ) {
          return `Неправильный вопрос в теме ${topic.id} раунда ${round.id} в файле-конфигурации`;
        }
        const questionError = checkQuestion(
          question,
          `в теме ${topic.id} раунда ${round.id}`,
        );
        if (questionError) {
          return questionError;
        }
      }
    }
  }
  if (game.superRound !== undefined && game.superRound !== null) {
    if (
      typeof game.superRound !== 'object' ||
      Array.isArray(game.superRound)
    ) {
      return `Неправильный супер раунд в файле-конфигурации`;
    }
    if (!Array.isArray(game.superRound.questions)) {
      return `Неправильный список вопросов супер раунда в файле-конфигурации`;
    }
    for (const question of game.superRound.questions) {
      if (typeof question !== 'object' || question === null || Array.isArray(question)) {
        return `Неправильный вопрос в супер раунде в файле-конфигурации`;
      }
      const questionError = checkQuestion(question, 'в супер раунде');
      if (questionError) {
        return questionError;
      }
    }
  }

  if (!game.rounds || game.rounds.length !== game.settings.rounds) {
    return `Неправильное колличство раундов в файле-конфигурации`;
  }
  for (const round of game.rounds) {
    if (!round.topics || round.topics.length !== game.settings.topicsInRound) {
      return `Неправильное колличство тем в раунде ${round.id} у файла-конфигурации`;
    }
    for (const topic of round.topics) {
      if (!topic.questions || topic.questions.length !== game.settings.questionsInTopic) {
        return `Неправильное колличство вопросов в теме ${topic.id} у файла-конфигурации`;
      }
    }
  }
  if (!game.superRound || game.superRound.questions.length !== game.settings.superQuestions) {
    return `Неправильное колличство вопросов в супер раунде у файла-конфигурации`;
  }
  if (!game.settings.minPrice) {
    return `Не указана минимальная стоимость в настройках у файла-конфигурации`;
  }

  return null;
}
