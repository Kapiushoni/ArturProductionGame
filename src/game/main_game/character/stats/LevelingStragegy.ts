import { as3as, bindMethods, uint } from '@/flash/as3';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { Stat } from '@/game/main_game/character/stats/Stat';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/**
 * How stats grow with the level: a stat at level L is base * mod^(L-1).
 * Config (Leveling_* in config.di): { maxHPMod, attMod, defMod, luckMod }.
 */
export class LevelingStragegy {
  private maxHPMod: number;
  private attMod: number;
  private defMod: number;
  private luckMod: number;

  constructor(config: any) {
    this.maxHPMod = Number(config.maxHPMod);
    this.attMod = Number(config.attMod);
    this.defMod = Number(config.defMod);
    this.luckMod = Number(config.luckMod);
  }
  /** raises all stats from the current level to newLevel; returns the new level */
  level(newLevel: number, stats: Stats): number {
    newLevel = uint(newLevel);
    const current = uint(stats.getLevel());
    if (newLevel == current) {
      return newLevel;
    }
    const base = (type: number) => Number(stats.getStat(type).getValue());
    this.levelUp(stats.getStat(StatType.LUCK), base(StatType.BASE_LUCK), this.luckMod, current, newLevel);
    const health = as3as(stats.getStat(StatType.HEALTH), HealthStat) as HealthStat;
    this.levelUp(health.getUpperBound(), base(StatType.BASE_HEALTH), this.maxHPMod, current, newLevel);
    this.levelUp(health, base(StatType.BASE_HEALTH), this.maxHPMod, current, newLevel);
    this.levelUp(stats.getStat(StatType.ATTACK), base(StatType.BASE_ATTACK), this.attMod, current, newLevel);
    this.levelUp(stats.getStat(StatType.DEFENSE), base(StatType.BASE_DEFENSE), this.defMod, current, newLevel);
    return newLevel;
  }
  /** adds the difference between the stat at toLevel and at fromLevel (rounded) */
  levelUp(stat: Stat, base: number, mod: number, fromLevel: number, toLevel: number) {
    base = Number(base);
    mod = Number(mod);
    fromLevel = uint(fromLevel);
    toLevel = uint(toLevel);
    if (fromLevel == toLevel) {
      return;
    }
    const before = fromLevel > 1 ? base * Math.pow(mod, fromLevel - 1) : base;
    const after = base * Math.pow(mod, toLevel - 1);
    stat.modifyValue(Math.round(after - before));
  }
}
bindMethods(LevelingStragegy);
