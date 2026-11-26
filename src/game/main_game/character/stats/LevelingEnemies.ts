// @ts-nocheck
import { bindMethods, int, uint } from '@/flash/as3';
import { LevelingStragegy } from '@/game/main_game/character/stats/LevelingStragegy';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class LevelingEnemies extends LevelingStragegy {
  static extraLevel = null;
  declare xpMod: any;
  declare extraLevel: any;
  constructor(singletonLock) {
         var obj = main.config.get("Leveling_Enemies");
          super(obj);
         this.xpMod = Number(obj.xpMod);
         this.extraLevel = int(0);
      }
  static setBonus(extraLevelBonus) {
         LevelingEnemies.extraLevel = extraLevelBonus;
      }
  static getNewInstance(characterConfigData) {
         var levelingEnemies = new LevelingEnemies(new SingletonLock());
         if(LevelingEnemies.extraLevel != null)
         {
            LevelingEnemies.extraLevel.apply(characterConfigData,levelingEnemies);
         }
         return levelingEnemies;
      }
  setExtraLevel(extraLevel) { extraLevel = int(extraLevel);
         this.extraLevel = int(extraLevel);
      }
  level(num, stats) { num = uint(num); const __self = this;
         var num2 = Number(NaN);
         num = uint(Math.max(num + this.extraLevel,1));
         var level = uint(stats.getLevel());
         num = uint(super.level(num,stats));
         if(num == level)
         {
            return uint(num);
         }
         var stat = stats.getStat(StatType.EXPERIENCE);
         var value = Number(stats.getStat(StatType.BASE_XP).getValue());
         __self.levelUp(stat,value,this.xpMod,level,num);
         return uint(num);
      }
}
LevelingEnemies.prototype.xpMod = NaN;
LevelingEnemies.prototype.extraLevel = 0;
bindMethods(LevelingEnemies);

class SingletonLock {
  constructor() {
      
   }
}
bindMethods(SingletonLock);
