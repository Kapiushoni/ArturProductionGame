import { bindMethods } from '@/flash/as3';
import { Util } from '@/game/util/Util';
import type { DungeonConfigData } from '@/game/main_game/dungeon/DungeonConfigData';

/**
 * A row of dungeons.csv: enemy1..enemy10 ("name:level"), lootDrop1..lootDrop10 ("item:weight"),
 * layer1..layer3 (backgrounds). A "null" entry ends a list.
 */
export class DungeonConfigParser implements DungeonConfigData {
  private enemies: string[][];
  private loot: string[][];
  private backgrounds: any[];

  constructor(row: any) {
    this.enemies = DungeonConfigParser.parsePairs(row, 'enemy');
    this.loot = DungeonConfigParser.parseLootData(row);
    this.backgrounds = [];
    for (let i = 1; i <= 3; i++) {
      this.backgrounds.push(Util.parseArray(row['layer' + i]));
    }
  }
  /** [item id, weight] pairs from lootDrop1..10 (also used for firstLoot.csv) */
  static parseLootData(row: any): string[][] {
    return DungeonConfigParser.parsePairs(row, 'lootDrop');
  }
  /** "a:b" values of row[prefix + 1..10], until the first "null" */
  private static parsePairs(row: any, prefix: string): string[][] {
    const pairs = [];
    for (let i = 1; i <= 10; i++) {
      const parts = row[prefix + i].split(':');
      if (parts[0] == 'null') {
        break;
      }
      pairs.push([parts[0], parts[1]]);
    }
    return pairs;
  }
  get enemiesData(): string[][] {
    return this.enemies;
  }
  get lootData(): string[][] {
    return this.loot;
  }
  get backgroundsData(): any[] {
    return this.backgrounds;
  }
}
bindMethods(DungeonConfigParser);
