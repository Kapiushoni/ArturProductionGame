import { as3keys, as3values } from '@/flash/as3';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { DungeonConfigParser } from '@/game/main_game/dungeon/DungeonConfigParser';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';
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
  getDungeon(level: Level, game: any): Dungeon {
    const config = DungeonFactory.getConfigFor(level.dungeonId);
    if (level.dungeonId == BossDungeon.idBossLevel) {
      return new BossDungeon(level, config, this.getFirstLoot(level), game);
    }
    return new Dungeon(level, config, this.getFirstLoot(level), game);
  }
  /** the first-time loot of a level not cleared yet (empty otherwise) */
  getFirstLoot(level: Level): ProbabilisticSet {
    const loot = new ProbabilisticSet();
    if (!level.isCleared()) {
      for (const entry of as3values(DungeonConfigParser.parseLootData(DungeonFactory.firstLootData.get(level.id)))) {
        loot.add(entry[0], entry[1] as any);
      }
    }
    return loot;
  }
}

class SingletonLock {}
