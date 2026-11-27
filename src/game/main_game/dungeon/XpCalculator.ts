import { as3as, as3values, int } from '@/flash/as3';
import { services } from '@/game/services';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { IXpCalculator } from '@/game/main_game/dungeon/IXpCalculator';

/**
 * Experience earned in a dungeon: the XP of the beaten enemies, plus for every mix / critical hit
 * a percentage (ExperienceBonus.mix / .critical in config.di) of the XP the jinn needs for its current level.
 */
export class XpCalculator implements IXpCalculator {
  get config(): any {
    return services.config.get('ExperienceBonus');
  }
  getXp(defeated: any[]): number {
    let xp = 0;
    for (const enemy of as3values(defeated)) {
      xp = int(xp + enemy.stats.getStat(StatType.EXPERIENCE).getValue());
    }
    return xp;
  }
  /** XP from the start to the end of the jinn's current level */
  requiredExperience(jinn: any): number {
    const experience = as3as(jinn.stats.getStat(StatType.EXPERIENCE), Experience) as Experience;
    return Number(experience.getUpperBound());
  }
  getMixXp(mixes: number, jinn: any): number {
    return Math.round((int(mixes) * this.requiredExperience(jinn) * this.config.mix) / 100);
  }
  getCriticalXp(criticalHits: number, jinn: any): number {
    return Math.round((int(criticalHits) * this.requiredExperience(jinn) * this.config.critical) / 100);
  }
}
