import { GameTemplate } from '../_models/game-template';
import { Question } from '../_models/question';
import { QuestionTypes } from '../_enums/question-types.enum';

/**
 * Light checks for one Question. `where` names the question's 1-based
 * location (topic and round, or the super round) for the failure message.
 * Pack ids are never cited — they are not trusted (ticket 03/ADR 0004).
 */
function checkQuestion(question: Question, where: string): string | null {
  if (typeof question.text !== 'string') {
    return `Неправильный текст вопроса ${where} в файле-конфигурации`;
  }
  if (typeof question.answer !== 'string') {
    return `Неправильный ответ вопроса ${where} в файле-конфигурации`;
  }
  if (!Object.values(QuestionTypes).includes(question.type)) {
    return `Неизвестный тип вопроса ${where} в файле-конфигурации`;
  }
  return null;
}

/**
 * Decides whether GameTemplate JSON is valid. Returns null when the template
 * is valid, otherwise the BalloonError message describing the first problem
 * found. Raises nothing: the caller decides whether to surface the message.
 * Pack ids and the players list are never checked — pack ids are ignored at
 * import and players are tolerated (ticket 03).
 */
export function validateGameTemplate(template: GameTemplate): string | null {
  // Light field/type checks first, so ill-typed input cannot crash the
  // structural counts below.
  if (typeof template.name !== 'string') {
    return `Неправильное название шаблона игры в файле-конфигурации`;
  }
  if (
    typeof template.author !== 'object' ||
    template.author === null ||
    Array.isArray(template.author)
  ) {
    return `Неправильный автор шаблона игры в файле-конфигурации`;
  }
  if (!Array.isArray(template.rounds)) {
    return `Неправильный список раундов в файле-конфигурации`;
  }
  if (
    typeof template.settings !== 'object' ||
    template.settings === null ||
    Array.isArray(template.settings)
  ) {
    return `Неправильные настройки в файле-конфигурации`;
  }
  if (template.images !== undefined && !Array.isArray(template.images)) {
    return `Неправильный список изображений шаблона игры в файле-конфигурации`;
  }
  for (const [roundIndex, round] of template.rounds.entries()) {
    const roundNo = roundIndex + 1;
    if (typeof round !== 'object' || round === null || Array.isArray(round)) {
      return `Неправильный раунд в файле-конфигурации`;
    }
    if (!Array.isArray(round.topics)) {
      continue; // not iterable — the structural check below names the round
    }
    for (const [topicIndex, topic] of round.topics.entries()) {
      const topicNo = topicIndex + 1;
      if (typeof topic !== 'object' || topic === null || Array.isArray(topic)) {
        return `Неправильная тема в раунде ${roundNo} в файле-конфигурации`;
      }
      if (!Array.isArray(topic.questions)) {
        continue; // not iterable — the structural check below names the topic
      }
      for (const [questionIndex, question] of topic.questions.entries()) {
        const questionNo = questionIndex + 1;
        if (typeof question !== 'object' || question === null || Array.isArray(question)) {
          return `Неправильный вопрос ${questionNo} в теме ${topicNo} раунда ${roundNo} в файле-конфигурации`;
        }
        const questionError = checkQuestion(
          question,
          `${questionNo} в теме ${topicNo} раунда ${roundNo}`,
        );
        if (questionError) {
          return questionError;
        }
      }
    }
  }
  if (template.superRound !== undefined && template.superRound !== null) {
    if (typeof template.superRound !== 'object' || Array.isArray(template.superRound)) {
      return `Неправильный супер раунд в файле-конфигурации`;
    }
    if (!Array.isArray(template.superRound.questions)) {
      return `Неправильный список вопросов супер раунда в файле-конфигурации`;
    }
    for (const [questionIndex, question] of template.superRound.questions.entries()) {
      const questionNo = questionIndex + 1;
      if (typeof question !== 'object' || question === null || Array.isArray(question)) {
        return `Неправильный вопрос ${questionNo} в супер раунде в файле-конфигурации`;
      }
      const questionError = checkQuestion(question, `${questionNo} в супер раунде`);
      if (questionError) {
        return questionError;
      }
    }
  }

  if (!template.rounds || template.rounds.length !== template.settings.rounds) {
    return `Неправильное колличство раундов в файле-конфигурации`;
  }
  for (const [roundIndex, round] of template.rounds.entries()) {
    const roundNo = roundIndex + 1;
    if (!round.topics || round.topics.length !== template.settings.topicsInRound) {
      return `Неправильное колличство тем в раунде ${roundNo} у файла-конфигурации`;
    }
    for (const [topicIndex, topic] of round.topics.entries()) {
      const topicNo = topicIndex + 1;
      if (!topic.questions || topic.questions.length !== template.settings.questionsInTopic) {
        return `Неправильное колличство вопросов в теме ${topicNo} у файла-конфигурации`;
      }
    }
  }
  if (!template.superRound || template.superRound.questions.length !== template.settings.superQuestions) {
    return `Неправильное колличство вопросов в супер раунде у файла-конфигурации`;
  }
  if (!template.settings.minPrice) {
    return `Не указана минимальная стоимость в настройках у файла-конфигурации`;
  }

  return null;
}
