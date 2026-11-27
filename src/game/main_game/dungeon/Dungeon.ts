import { as3values, bindMethods, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { Signal } from '@/game/cb/signals/Signal';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonStats } from '@/game/main_game/dungeon/DungeonStats';
import { Fight } from '@/game/main_game/dungeon/Fight';
import { Loot } from '@/game/main_game/dungeon/Loot';
import type { IFight } from '@/game/main_game/dungeon/IFight';
import type { IXpCalculator } from '@/game/main_game/dungeon/IXpCalculator';
import type { ProbabilisticSet } from '@/game/util/ProbabilisticSet';
import type { Game } from '@/game/main_game/Game';
import type { DungeonConfigData } from '@/game/main_game/dungeon/DungeonConfigData';
import type { Enemy } from '@/game/main_game/character/Enemy';
import type { Level } from '@/game/main_game/map/Level';

/**
 * A dungeon run: its fights one after another (startFight, then wonFight / lostFight from the view), the loot,
 * and the stats for the experience at the end. Gear is locked and potions unlocked while inside.
 */
export class Dungeon {
  /** the boss dungeon (see BossDungeon) */
  static readonly BOSS_LEVEL_ID = '25';
  onFight: Signal;
  onLose: Signal;
  onWin: Signal;
  private loot: Loot;
  private fights: IFight[];
  /** index of the current fight */
  private current = 0;
  private fighting = false;
  private level: Level; // map Level
  private stats: DungeonStats;
  /** the game it is played in (the jinn, the mixer) */
  protected game: Game;

  /** config: the dungeon's row (enemiesData, lootData); extraLoot: items that drop first (first-time loot) */
  constructor(level: Level, config: DungeonConfigData, extraLoot: ProbabilisticSet, game: Game) {
    this.game = game;
    this.level = level;
    this.onLose = new Signal();
    this.onWin = new Signal();
    this.onFight = new Signal();
    this.stats = new DungeonStats(level, game);
    this.fights = [];
    this.initializeFights(config);
    this.loot = this.createLoot(config, extraLoot);
    this.current = 0;
  }
  static get DungeonConfig(): any {
    return services.config.get('DungeonConfig');
  }
  /** see DungeonStats.xpCalculator */
  static get xpCalulator(): IXpCalculator {
    return DungeonStats.xpCalculator;
  }
  static set xpCalulator(value: IXpCalculator) {
    DungeonStats.xpCalculator = value;
  }
  enter() {
    services.saveSystem.savePendingItems();
    const jinn = this.game.getJinn();
    jinn.gear.lock();
    jinn.liver.unlock();
    this.stats.start();
  }
  getId(): string {
    return this.level.id;
  }
  getStats(): DungeonStats {
    return this.stats;
  }
  exit() {
    services.saveSystem.savePendingItems();
    this.releaseJinn();
    this.clear();
  }
  /** unlocks the gear, locks the potions and ends the active potion */
  private releaseJinn() {
    this.game.getJinn().gear.unlock();
    this.game.getJinn().liver.lock();
    this.game.getJinn().liver.clearBuffs();
  }
  createLoot(config: DungeonConfigData, extraLoot: ProbabilisticSet): Loot {
    return new Loot(config, extraLoot);
  }
  initializeFights(config: DungeonConfigData) {
    let first = true;
    for (const enemy of as3values(config.enemiesData)) {
      // [enemy name, level]
      this.fights.push(this.createFight(this.createEnemy(enemy[0], enemy[1]), first));
      first = false;
    }
  }
  createFight(enemy: any, first: boolean): IFight {
    return new Fight(this.game.getJinn(), enemy, first);
  }
  createEnemy(name: string, level: number): Enemy {
    return CharacterFactory.getInstance().getEnemy(name, uint(level));
  }
  get enemies(): any[] {
    const list = [];
    for (const fight of as3values(this.fights)) {
      list.push(fight.getEnemy());
    }
    return list;
  }
  getLoot(): Loot {
    return this.loot;
  }
  startFight() {
    this.fighting = true;
    this.onFight.emit(this.currentFight);
    this.currentFight.fight();
  }
  get currentFight(): IFight {
    return this.fights[this.current];
  }
  wonFight() {
    this.fighting = false;
    if (this.current == this.fights.length - 1) {
      // the last fight: the dungeon is cleared
      this.releaseJinn();
      this.currentFight.deactivate();
      ++this.current;
      this.stats.end(this.getDefeated());
      this.advertiseAchievements();
      this.onWin.emit();
      this.level.clear();
      services.saveSystem.saveClearedLevel(this.getId());
    } else {
      this.currentFight.leave(this.goToNextFight);
    }
  }
  advertiseAchievements() {
    if (this.level.dungeonId == Dungeon.BOSS_LEVEL_ID) {
      services.achievements.endLastDungeon();
    }
    if (this.level.dungeonId == '8') {
      services.achievements.finishFirstPage();
    }
    const gear = this.game.getJinn().gear;
    if (gear.equipment_1.isEmpty() && gear.equipment_2.isEmpty() && gear.shield.isEmpty() && gear.weapon.isEmpty()) {
      services.achievements.unequippedDungeonCompleted(this.level);
    }
  }
  /** the player left the dungeon */
  suddenDeath() {
    this.stats.end(this.getDefeated());
    if (this.fighting) {
      this.currentFight.suddenDeath();
      this.fighting = false;
    } else {
      this.onLose.emit();
    }
  }
  /** enemies beaten so far */
  getDefeated(): any[] {
    const list = [];
    for (let i = 0; i < this.current; i++) {
      list.push(this.fights[i].getEnemy());
    }
    return list;
  }
  goToNextFight() {
    this.currentFight.deactivate();
    ++this.current;
    this.startFight();
  }
  lostFight() {
    this.fighting = false;
    this.stats.end(this.getDefeated());
    this.releaseJinn();
    this.onLose.emit();
  }
  clear() {
    while (this.current < this.fights.length) {
      this.currentFight.deactivate();
      ++this.current;
    }
    for (const fight of as3values(this.fights)) {
      fight.clear();
    }
    this.fights = null;
    this.stats.clear();
    this.stats = null;
    this.onLose.clear();
    this.onLose = null;
    this.onWin.clear();
    this.onWin = null;
    this.onFight.clear();
    this.onFight = null;
  }
  getLevel(): Level {
    return this.level;
  }
}
bindMethods(Dungeon);
