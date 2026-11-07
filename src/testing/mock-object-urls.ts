import { vi } from 'vitest';

/**
 * Stubs the blob object-URL statics (jsdom does not implement them) and
 * records every create/revoke call, so specs can assert URL lifecycle:
 * call in a beforeEach, assert on `created`/`revoked`. Each call yields
 * `blob:mock-1`, `blob:mock-2`, …
 */
export function mockObjectUrls(): {
  created: string[];
  revoked: string[];
  createObjectURL: ReturnType<typeof vi.fn>;
  revokeObjectURL: ReturnType<typeof vi.fn>;
} {
  const created: string[] = [];
  const revoked: string[] = [];
  let seq = 0;
  const createObjectURL = vi.fn((obj: Blob | MediaSource): string => {
    void obj;
    const url = `blob:mock-${++seq}`;
    created.push(url);
    return url;
  });
  const revokeObjectURL = vi.fn((url: string): void => {
    revoked.push(url);
  });
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
  return { created, revoked, createObjectURL, revokeObjectURL };
}
