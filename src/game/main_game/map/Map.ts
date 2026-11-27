import { Dictionary, as3as, as3values, bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { DailyBonus } from '@/game/bonus/DailyBonus';
import { cbArray } from '@/game/cb/utils/cbArray';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { Element } from '@/game/main_game/element/Element';
import { LegendaryLevel } from '@/game/main_game/map/LegendaryLevel';
import { Level } from '@/game/main_game/map/Level';
import { SpecialLevel } from '@/game/main_game/map/SpecialLevel';

/**
 * The dungeon map. Main path 1 -> 2 -> ... -> 25 (25 = boss); side dungeons 26-30 branch off and rejoin it;
 * 31 / 32 are the legendary ice / fire dungeons. Clearing a level unlocks the levels it leads to.
 */
export class Map {
  /** Dictionary: dungeon id -> Level */
  levels: any;

  constructor() {
    this.initializeLevels();
    this.setConections();
    this.getLevel('1').unlock();
    this.loadSave();
    this.unlockUnlocked();
  }
  getNextLevel(level: Level): Level | null {
    const next = level.correlative;
    return next.length > 0 ? next[0] : null;
  }
  /** the furthest unlocked level of the main path */
  biggestUnlockedLevel(): Level | null {
    let level = null;
    for (let i = 1; i <= 25; i++) {
      if ((as3as(this.levels.get(i), Level) as Level).isUnlocked()) {
        level = this.levels.get(i);
      }
    }
    return level;
  }
  getLevel(id: string | number): any {
    return this.levels.get(id);
  }
  initializeLevels() {
    this.levels = new Dictionary();
    for (const id of as3values(DungeonFactory.getInstance().getDungeonsIds())) {
      if (id == '31') {
        this.addLevel(new LegendaryLevel(id, Element.ice, DailyBonus.getNextSpecialDungeonDate(Element.ice)));
      } else if (id == '32') {
        this.addLevel(new LegendaryLevel(id, Element.fire, DailyBonus.getNextSpecialDungeonDate(Element.fire)));
      } else if (['26', '27', '28', '29', '30'].indexOf(id) >= 0) {
        this.addLevel(new SpecialLevel(id));
      } else {
        this.addLevel(new Level(id));
      }
    }
  }
  addLevel(level: Level) {
    this.levels.set(level.dungeonId, level);
  }
  /** which level leads to which */
  setConections() {
    const link = (from: number, to: number) => this.levels.get(from).addCorrelative(this.levels.get(to));
    for (let i = 1; i < 25; i++) {
      link(i, i + 1);
    }
    link(4, 26);
    link(15, 27);
    link(19, 28);
    link(23, 29);
    link(29, 30);
    link(26, 6);
    link(27, 16);
    link(28, 20);
    link(30, 24);
  }
  loadSave() {
    for (const id of as3values(services.saveSystem.getClearedLevels())) {
      this.getLevel(id).clear();
    }
  }
  /** unlocks the levels after the cleared ones; returns the newly unlocked levels */
  unlockUnlocked(): cbArray {
    const unlocked = new cbArray();
    for (const level of as3values(this.levels)) {
      if (level.isCleared()) {
        for (const next of as3values(level.correlative)) {
          if (next.isLocked()) {
            next.unlock();
            unlocked.pushIfNotPresent(next);
          }
        }
      }
    }
    return unlocked;
  }
  clear() {
    this.levels = null;
  }
}
bindMethods(Map);
