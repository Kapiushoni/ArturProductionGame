import { as3as, bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { Stats } from '@/game/main_game/character/stats/Stats';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { LevelingStragegy } from '@/game/main_game/character/stats/LevelingStragegy';
import { PersistentExperience } from '@/game/main_game/character/stats/PersistentExperience';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';
import type { Fighter } from '@/game/main_game/character/Fighter';

/** The jinn's stats: the level comes from the saved experience; health starts empty and is refilled on load. */
export class JinnStats extends Stats {
  constructor(config: CharacterConfigData, fighter: Fighter) {
    super(config, fighter, new LevelingStragegy(services.config.get('Leveling_Jinn')));
    this.stats.set(StatType.HEALTH, new HealthStat(StatType.HEALTH, new Stat(StatType.MAX_HP, config.baseHP), 0));
    this.stats.set(StatType.EXPERIENCE, new PersistentExperience(this));
  }
  getLevel(): number {
    return (as3as(this.stats.get(StatType.EXPERIENCE), Experience) as Experience).getLevel();
  }
  loadData() {
    (as3as(this.stats.get(StatType.EXPERIENCE), PersistentExperience) as PersistentExperience).startPersistence();
  }
}
bindMethods(JinnStats);
