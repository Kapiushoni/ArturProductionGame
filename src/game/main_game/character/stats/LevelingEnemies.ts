import { bindMethods, int, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { LevelingStragegy } from '@/game/main_game/character/stats/LevelingStragegy';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/** Enemy levelling: like the jinn's, plus XP reward growth and the daily "extra level" bonus. */
export class LevelingEnemies extends LevelingStragegy {
  /** active ExtraLevelBonus (daily bonus), or null */
  static extraLevel: any = null;
  private xpMod: number;
  private extraLevel = 0;

  constructor(_lock: SingletonLock) {
    const config = services.config.get('Leveling_Enemies');
    super(config);
    this.xpMod = Number(config.xpMod);
  }
  static setBonus(extraLevelBonus: any) {
    LevelingEnemies.extraLevel = extraLevelBonus;
  }
  static getNewInstance(characterConfig: any): LevelingEnemies {
    const leveling = new LevelingEnemies(new SingletonLock());
    if (LevelingEnemies.extraLevel != null) {
      LevelingEnemies.extraLevel.apply(characterConfig, leveling);
    }
    return leveling;
  }
  setExtraLevel(extraLevel: number) {
    this.extraLevel = int(extraLevel);
  }
  level(newLevel: number, stats: Stats): number {
    newLevel = uint(Math.max(uint(newLevel) + this.extraLevel, 1));
    const current = uint(stats.getLevel());
    newLevel = uint(super.level(newLevel, stats));
    if (newLevel == current) {
      return newLevel;
    }
    const baseXP = Number(stats.getStat(StatType.BASE_XP).getValue());
    this.levelUp(stats.getStat(StatType.EXPERIENCE), baseXP, this.xpMod, current, newLevel);
    return newLevel;
  }
}
bindMethods(LevelingEnemies);

class SingletonLock {}
