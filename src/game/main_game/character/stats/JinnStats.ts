// @ts-nocheck
import { as3as, bindMethods, uint } from '@/flash/as3';
import { Stats } from '@/game/main_game/character/stats/Stats';
import { main } from '@/game/main';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { LevelingStragegy } from '@/game/main_game/character/stats/LevelingStragegy';
import { PersistentExperience } from '@/game/main_game/character/stats/PersistentExperience';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class JinnStats extends Stats {
  constructor(characterConfigData, fighter) {
         var obj = main.config.get("Leveling_Jinn");
          super(characterConfigData,fighter,new LevelingStragegy(obj)); const __self = this;
         __self.stats.set(StatType.HEALTH, new HealthStat(StatType.HEALTH,new Stat(StatType.MAX_HP,characterConfigData.baseHP),0));
         __self.stats.set(StatType.EXPERIENCE, new PersistentExperience(this));
      }
  getLevel() { const __self = this;
         return uint((as3as(__self.stats.get(StatType.EXPERIENCE), Experience)).getLevel());
      }
  loadData() { const __self = this;
         (as3as(__self.stats.get(StatType.EXPERIENCE), PersistentExperience)).startPersistence();
      }
}
bindMethods(JinnStats);
