import { describe, it, expect } from 'vitest';

describe('game modules', () => {
  it('load in dependency order without errors', async () => {
    const GM = await import('@/game/index');
    expect(Object.keys(GM).length).toBe(268);
  }, 30000); // the first run transforms all 291 modules
});
