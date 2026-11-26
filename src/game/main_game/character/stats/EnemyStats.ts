// @ts-nocheck
import { as3as, bindMethods, uint } from '@/flash/as3';
import { Stats } from '@/game/main_game/character/stats/Stats';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { LevelingEnemies } from '@/game/main_game/character/stats/LevelingEnemies';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class EnemyStats extends Stats {
  level = uint(1);
  constructor(characterConfigData, fighter) {
          super(characterConfigData,fighter,LevelingEnemies.getNewInstance(characterConfigData)); const __self = this;
         __self.stats.set(StatType.HEALTH, new HealthStat(StatType.HEALTH,new Stat(StatType.MAX_HP,characterConfigData.baseHP),characterConfigData.baseHP));
         __self.stats.set(StatType.BASE_XP, new Stat(StatType.EXPERIENCE,characterConfigData.baseXP));
         __self.stats.set(StatType.EXPERIENCE, new Stat(StatType.EXPERIENCE,characterConfigData.baseXP));
      }
  getLevel() {
         return uint(this.level);
      }
  leveling(num) { num = uint(num); const __self = this;
         this.level = uint(__self.levelingStrat.level(num,this));
      }
  loadData() { const __self = this;
         (as3as(__self.stats.get(StatType.HEALTH), HealthStat)).fill();
      }
}
bindMethods(EnemyStats);
