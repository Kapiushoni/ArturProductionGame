import { describe, it, expect } from 'vitest';

describe('game modules', () => {
  it('load without errors', async () => {
    const GM = await import('@/game/index');
    expect(Object.keys(GM).length).toBe(232);
  }, 60000); // the first run transforms all the modules
});
