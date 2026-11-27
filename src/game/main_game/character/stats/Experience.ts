import { bindMethods } from '@/flash/as3';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/**
 * Experience and level. `value` is the total XP; getValue() / getUpperBound() are the XP inside the current level.
 * Experience.config (jinnXP.csv): level -> { XP: total XP needed to finish that level }.
 */
export class Experience extends Stat {
  static config: any = null;
  protected level = 1;
  protected stats: Stats;

  constructor(stats: Stats) {
    super(StatType.EXPERIENCE, 1);
    this.stats = stats;
    this.refreshLevel();
  }
  static set configuration(value: any) {
    Experience.config = value;
  }
  /** XP needed to finish a level; past the end of the table each level needs 1.5x the previous one */
  private static threshold(level: number): number {
    if (Experience.config.get(level) == null) {
      const previous = Number(Experience.config.get(level - 1)['XP']);
      Experience.config.set(level, { XP: Math.round(previous + previous / 2) });
    }
    return Experience.config.get(level)['XP'];
  }
  refreshLevel() {
    let level = 1;
    while (Experience.config.get(level)['XP'] <= this.value) {
      level++;
      Experience.threshold(level);
    }
    if (level != this.level) {
      this.stats.leveling(level);
      this.level = level;
    }
  }
  private levelStart(): number {
    return this.level > 1 ? Number(Experience.config.get(this.level - 1)['XP']) : 0;
  }
  /** XP from the start to the end of the current level */
  getUpperBound(): number {
    return Experience.config.get(this.level)['XP'] - this.levelStart();
  }
  modifyValue(amount: number) {
    super.modifyValue(amount);
    this.refreshLevel();
  }
  /** XP gained inside the current level */
  getValue(): number {
    return this.value - this.levelStart();
  }
  getLevel(): number {
    return this.level;
  }
}
bindMethods(Experience, ['getValue']);
