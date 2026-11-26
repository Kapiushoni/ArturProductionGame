// @ts-nocheck
import { as3as, bindMethods, uint } from '@/flash/as3';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class LevelingStragegy {
  declare maxHPMod: any;
  declare attMod: any;
  declare defMod: any;
  declare luckMod: any;
  constructor(obj) {
         
         this.maxHPMod = Number(obj.maxHPMod);
         this.attMod = Number(obj.attMod);
         this.defMod = Number(obj.defMod);
         this.luckMod = Number(obj.luckMod);
      }
  level(num, stats) { num = uint(num);
         var num2 = Number(NaN);
         var stat = null;
         var value = Number(NaN);
         var level = uint(stats.getLevel());
         if(num == level)
         {
            return uint(num);
         }
         stat = stats.getStat(StatType.LUCK);
         value = Number(stats.getStat(StatType.BASE_LUCK).getValue());
         this.levelUp(stat,value,this.luckMod,level,num);
         var healthStat = as3as(stats.getStat(StatType.HEALTH), HealthStat);
         value = Number(stats.getStat(StatType.BASE_HEALTH).getValue());
         this.levelUp(healthStat.getUpperBound(),value,this.maxHPMod,level,num);
         this.levelUp(healthStat,value,this.maxHPMod,level,num);
         stat = stats.getStat(StatType.ATTACK);
         value = Number(stats.getStat(StatType.BASE_ATTACK).getValue());
         this.levelUp(stat,value,this.attMod,level,num);
         stat = stats.getStat(StatType.DEFENSE);
         value = Number(stats.getStat(StatType.BASE_DEFENSE).getValue());
         this.levelUp(stat,value,this.defMod,level,num);
         return uint(num);
      }
  levelUp(stat, num, num2, num3, num4) { num = Number(num); num2 = Number(num2); num3 = uint(num3); num4 = uint(num4);
         if(num3 == num4)
         {
            return;
         }
         var num5 = Number(num);
         if(num3 > 1)
         {
            num5 = Number(num * Math.pow(num2,num3 - 1));
         }
         var num6 = Number(num * Math.pow(num2,num4 - 1) - num5);
         stat.modifyValue(Math.round(num6));
      }
}
LevelingStragegy.prototype.maxHPMod = NaN;
LevelingStragegy.prototype.attMod = NaN;
LevelingStragegy.prototype.defMod = NaN;
LevelingStragegy.prototype.luckMod = NaN;
bindMethods(LevelingStragegy);
