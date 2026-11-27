import { as3as, bindMethods, uint } from '@/flash/as3';
import { Stats } from '@/game/main_game/character/stats/Stats';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { LevelingEnemies } from '@/game/main_game/character/stats/LevelingEnemies';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';

/** An enemy's stats: starts at full health, EXPERIENCE is the XP it gives when defeated. */
export class EnemyStats extends Stats {
  private level = 1;

  constructor(config: CharacterConfigData, fighter: any) {
    super(config, fighter, LevelingEnemies.getNewInstance(config));
    const maxHealth = new Stat(StatType.MAX_HP, config.baseHP);
    this.stats.set(StatType.HEALTH, new HealthStat(StatType.HEALTH, maxHealth, config.baseHP));
    this.stats.set(StatType.BASE_XP, new Stat(StatType.EXPERIENCE, config.baseXP));
    this.stats.set(StatType.EXPERIENCE, new Stat(StatType.EXPERIENCE, config.baseXP));
  }
  getLevel(): number {
    return this.level;
  }
  leveling(level: number) {
    this.level = uint(this.levelingStrat.level(uint(level), this));
  }
  loadData() {
    (as3as(this.stats.get(StatType.HEALTH), HealthStat) as HealthStat).fill();
  }
}
bindMethods(EnemyStats);
