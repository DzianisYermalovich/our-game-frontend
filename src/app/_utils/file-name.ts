/**
 * The zip download name: Windows-forbidden characters (< > : " / \ | ? * and
 * control chars) become underscores, trailing dots/spaces are dropped, and a
 * name that sanitizes to nothing falls back to «игра».
 */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/[. ]+$/, '')
    .trim();
  return cleaned || 'игра';
}
