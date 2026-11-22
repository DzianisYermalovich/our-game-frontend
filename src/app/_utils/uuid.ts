/** Generated uuid for ids at rest — pack ids are never read (ADR 0004). */
export function generateUuid(): string {
  return crypto.randomUUID();
}
