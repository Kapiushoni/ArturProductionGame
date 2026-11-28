import { RogueliteConfig } from '@/game/roguelite/RogueliteConfig';

/**
 * The roguelite mod's variety: each time a dungeon of the main path is entered its enemies and loot
 * are drawn anew from the dungeon's own table and its neighbours' (numbers in RogueliteConfig.variety).
 * Pure functions over the tables: the callers (DungeonFactory) pass the rows and what exists.
 */
const V = RogueliteConfig.variety;
/** the main path without the boss */
const LAST = 24;
const ELEMENTS = ['normal', 'ice', 'fire'];

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/** the main path dungeons around id (id itself not included) */
function neighbours(id: number, range: number): number[] {
  const out: number[] = [];
  for (let d = id - range; d <= id + range; d++) if (d !== id && d >= 1 && d <= LAST) out.push(d);
  return out;
}

export const Variety = {
  /** varied for this dungeon (main path, not the boss) */
  applies(id: number): boolean {
    return id >= 1 && id <= LAST;
  },

  /** [name, level] pairs: other elements, levels a step up or down, sometimes the other kind; shuffled, the strongest last */
  enemies(id: number, enemies: string[][], exists: (name: string) => boolean): string[][] {
    const out = enemies.map(([name, levelText]) => {
      let level = Number(levelText);
      const m = /^(enemy)(\d)_(normal|ice|fire)$/.exec(name);
      if (!m) return [name, levelText];
      let kind = Number(m[2]);
      let element = m[3];
      if (Math.random() < V.elementChance) element = pick(ELEMENTS.filter((e) => e !== element));
      if (id >= V.swapFrom && Math.random() < V.swapChance) {
        const other = kind === 1 ? 2 : 1;
        if (exists(`enemy${other}_${element}`)) {
          level += kind === 1 ? -1 : 1;
          kind = other;
        }
      }
      if (id >= V.levelJitterFrom) level += pick(V.levelJitter);
      const varied = `enemy${kind}_${element}`;
      return [exists(varied) ? varied : name, String(Math.max(1, level))];
    });
    // shuffled, but the strongest one stays the last fight
    let strongest = 0;
    out.forEach((e, i) => {
      if (Number(e[1]) >= Number(out[strongest][1])) strongest = i;
    });
    const last = out.splice(strongest, 1)[0];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    out.push(last);
    return out;
  },

  /** [item, weight] pairs: the dungeon's own, its neighbours' at a part of their weight, the fire / ice gear versions */
  loot(id: number, own: string[][], lootOf: (id: number) => string[][], exists: (item: string) => boolean): string[][] {
    const weights = new Map<string, number>();
    const add = (item: string, weight: number) => weights.set(item, (weights.get(item) ?? 0) + weight);
    for (const [item, w] of own) add(item, Number(w));
    for (const d of neighbours(id, V.lootNeighbours)) {
      // the dungeon's own items keep their own weight
      for (const [item, w] of lootOf(d)) if (own.every((e) => e[0] !== item)) add(item, Number(w) * V.neighbourWeight);
    }
    for (const [item, w] of [...weights]) {
      if (!/^(Sword|Shield)[A-Za-z]+$/.test(item) || /(Fire|Ice)$/.test(item)) continue;
      for (const el of ['Fire', 'Ice']) if (exists(item + el)) add(item + el, w * V.elementalGearWeight);
    }
    return [...weights].map(([item, w]) => [item, String(w)]);
  },

  /** a dungeon's first-time loot ([item, weight] pairs): as many items as it has, drawn from it and its neighbours' */
  firstLoot(id: number, own: string[][], firstOf: (id: number) => string[][]): string[][] {
    if (own.length === 0) return own;
    const pool = [...own];
    for (const d of neighbours(id, V.firstLootNeighbours)) {
      for (const entry of firstOf(d)) if (pool.every((e) => e[0] !== entry[0])) pool.push(entry);
    }
    const out: string[][] = [];
    while (out.length < own.length && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  },
};
