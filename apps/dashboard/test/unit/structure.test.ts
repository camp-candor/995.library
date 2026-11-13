import { describe, expect, it } from 'vitest';
import { checkFilesystemStructure } from '../../../../scripts/check-dashboard-structure.mjs';

describe('apps/dashboard directory structure', () => {
  it('contains only whitelisted top-level and src/* directories', () => {
    const violations = checkFilesystemStructure();
    expect(violations).toEqual([]);
  });
});

