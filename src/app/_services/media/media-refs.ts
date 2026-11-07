import { Game } from '../../_models/game';
import { Question } from '../../_models/question';

/** Collects every zip-root-relative media ref the Game points at. */
export function collectMediaRefs(game: Game): string[] {
  const refs: string[] = [...(game.images ?? [])];
  const questions: Question[] = game.rounds.flatMap((round) =>
    round.topics.flatMap((topic) => topic.questions),
  );
  if (game.superRound) {
    questions.push(...game.superRound.questions);
  }
  for (const question of questions) {
    refs.push(...(question.image ?? []), question.sound ?? '', question.answerImage ?? '');
  }
  return refs.filter((ref) => ref !== '');
}

/**
 * True when the ref points outside the zip root: absolute (`/x.png`,
 * `C:\x.png`) or climbing out (`../x.png`). Backslash is treated as a
 * separator so Windows-style refs are checked the same way.
 */
function escapesZipRoot(ref: string): boolean {
  if (ref.startsWith('/') || ref.startsWith('\\')) {
    return true;
  }
  if (/^[a-zA-Z]:/.test(ref)) {
    return true;
  }
  return ref.split(/[\\/]/).includes('..');
}

/**
 * Media layer (spec §3): every media ref must resolve to a file inside the
 * zip. Returns null when all refs resolve, otherwise the BalloonError message.
 */
export function checkMediaRefs(game: Game, zipNames: Set<string>): string | null {
  const refs = collectMediaRefs(game);
  const escaping = [...new Set(refs.filter((ref) => escapesZipRoot(ref)))];
  if (escaping.length > 0) {
    return `Пути выходят за пределы архива: ${escaping.join(', ')}`;
  }
  const missing = [...new Set(refs.filter((ref) => !zipNames.has(ref)))];
  if (missing.length > 0) {
    return `Отсутствуют файлы в архиве: ${missing.join(', ')}`;
  }
  return null;
}
