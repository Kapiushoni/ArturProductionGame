// Shared setup for game logic tests.
// Game modules are imported through the public index (any order works: there are no import cycles)
import { vi } from 'vitest';
import { Dictionary, SharedObject } from '@/flash/as3';
import * as GM from '@/game/index';

export { GM };

/** services.config for a test: section name -> plain object (like the parsed config.di) */
export function setConfig(sections: Record<string, any>) {
  GM.services.config = { get: (name: string) => sections[name] };
}

/** Dictionary from a plain object (keys as in AS3: numbers and strings are the same key) */
export function dict(entries: Record<string | number, any>) {
  const d: any = new Dictionary();
  for (const k of Object.keys(entries)) d.set(k, entries[k]);
  return d;
}

/** Math.random returns these values in order (then keeps returning the last one) */
export function randomSequence(...values: number[]) {
  let i = 0;
  return vi.spyOn(Math, 'random').mockImplementation(() => values[Math.min(i++, values.length - 1)]);
}

/** forget everything saved in localStorage, as if the game was opened for the first time */
export function clearSaves() {
  localStorage.clear();
  forgetLoadedSaves();
}

/** drop the in-memory copies of saves, as if the page was reloaded */
export function forgetLoadedSaves() {
  (SharedObject as any).cache.clear();
}

/** item config row (like a line of items.csv) */
export function itemConfig(over: Record<string, any> = {}) {
  return {
    NameString: 'test_item',
    MovieClip: 'mc_test',
    MixTime: 1,
    MaxMod: 30,
    Duration: 10,
    Element: 'N',
    Category: 'C',
    FirstModifier: { Category: null, Value: null },
    SecondModifier: { Category: null, Value: null },
    ...over,
  };
}

/** fighter stats stub for DamageCalculator */
export function fakeStats({ attack = 10, defense = 0, luck = 10, level = 1, health = 100 } = {}) {
  const { StatType } = GM;
  const values: Record<number, number> = {
    [StatType.ATTACK]: attack,
    [StatType.DEFENSE]: defense,
    [StatType.LUCK]: luck,
    [StatType.HEALTH]: health,
  };
  return {
    getLuck: () => luck,
    getLevel: () => level,
    getStat: (type: number) => ({ getValue: () => values[type] }),
  };
}
