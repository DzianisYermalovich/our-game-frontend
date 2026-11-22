/**
 * The zip download name: Windows-forbidden characters (< > : " / \ | ? * and
 * control chars) become underscores, trailing dots/spaces are dropped, and a
 * name that sanitizes to nothing falls back to the caller's domain word
 * («игра» for game exports, «шаблон» for template exports).
 */
export function sanitizeFileName(name: string, fallback: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/[. ]+$/, '')
    .trim();
  return cleaned || fallback;
}
