/** A dungeon's config (a row of dungeons.csv, see DungeonConfigParser). */
export interface DungeonConfigData {
  /** [enemy name, level] pairs */
  get enemiesData(): string[][];
  /** [item id, weight] pairs */
  get lootData(): string[][];
  /** background layers 1-3 */
  get backgroundsData(): any[];
}
