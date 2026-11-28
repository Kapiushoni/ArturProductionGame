import { as3keys, as3values } from '@/flash/as3';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { DungeonConfigParser } from '@/game/main_game/dungeon/DungeonConfigParser';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { Variety } from '@/game/roguelite/Variety';
import type { DungeonConfigData } from '@/game/main_game/dungeon/DungeonConfigData';
import type { Level } from '@/game/main_game/map/Level';

/**
 * Creates dungeons from dungeons.csv (id -> row). Until a dungeon is cleared,
 * its loot comes first from firstLoot.csv. Singleton.
 */
export class DungeonFactory {
  static instance: DungeonFactory = null;
  /** Dictionary: dungeon id -> row */
  static config: any = null;
  /** Dictionary: dungeon id -> row with lootDrop1..10 */
  static firstLootData: any = null;

  constructor(singletonLock: SingletonLock) {
    if (!singletonLock) {
      throw new Error('Static Class');
    }
  }
  /** can be set only once */
  static set firstLoot(value: any) {
    if (DungeonFactory.firstLootData != null) {
      throw new Error("Can't do that");
    }
    DungeonFactory.firstLootData = value;
  }
  static getInstance(): DungeonFactory {
    if (DungeonFactory.instance == null) {
      DungeonFactory.instance = new DungeonFactory(new SingletonLock());
    }
    return DungeonFactory.instance;
  }
  static setConfig(dict: any) {
    DungeonFactory.config = dict;
  }
  static getConfigFor(id: string): DungeonConfigParser {
    return new DungeonConfigParser(DungeonFactory.config.get(id));
  }
  getDungeonsIds(): string[] {
    const ids = [];
    for (const id of as3keys(DungeonFactory.config)) {
      ids.push(id);
    }
    return ids;
  }
  /** the roguelite mod draws the enemies and loot anew each time (not in the tutorial run: it needs dungeon 1 as it is) */
  private static varied(id: number): boolean {
    return Roguelite.enabled && Roguelite.tutorialDone && Variety.applies(id);
  }
  getDungeon(level: Level, game: any): Dungeon {
    let config: DungeonConfigData = DungeonFactory.getConfigFor(level.dungeonId);
    const id = Number(level.dungeonId);
    if (DungeonFactory.varied(id)) {
      const own = config;
      const enemies = Variety.enemies(id, own.enemiesData, (name) => CharacterFactory.config?.get(name) != null);
      const loot = Variety.loot(
        id,
        own.lootData,
        (d) => (DungeonFactory.config.get(String(d)) ? DungeonFactory.getConfigFor(String(d)).lootData : []),
        (item) => ItemFactory.config?.get(item) != null,
      );
      config = { enemiesData: enemies, lootData: loot, backgroundsData: own.backgroundsData };
    }
    if (level.dungeonId == BossDungeon.idBossLevel) {
      return new BossDungeon(level, config, this.getFirstLoot(level), game);
    }
    return new Dungeon(level, config, this.getFirstLoot(level), game);
  }
  /** the first-time loot of a level not cleared yet (empty otherwise) */
  getFirstLoot(level: Level): ProbabilisticSet {
    const loot = new ProbabilisticSet();
    if (!level.isCleared()) {
      const firstOf = (id: string): string[][] => {
        const row = DungeonFactory.firstLootData.get(id);
        return row ? DungeonConfigParser.parseLootData(row) : [];
      };
      const id = Number(level.dungeonId);
      let entries = firstOf(level.id);
      if (DungeonFactory.varied(id)) entries = Variety.firstLoot(id, entries, (d) => firstOf(String(d)));
      for (const entry of as3values(entries)) {
        loot.add(entry[0], entry[1] as any);
      }
    }
    return loot;
  }
}

class SingletonLock {}
