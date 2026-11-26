// @ts-nocheck
import { __DEFER, bindMethods, uint } from '@/flash/as3';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class Experience extends Stat {
  static config = null;
  declare level: any;
  declare stats: any;
  constructor(stats) {super(__DEFER); 
          this.__init_Stat(StatType.EXPERIENCE,1);
         this.stats = stats;
         this.level = uint(1);
         this.refreshLevel();
      }
  static set configuration(value) {
         Experience.config = value;
      }
  refreshLevel() {
         var num = Number(NaN);
         var level = uint(1);
         while(Experience.config.get(level)["XP"] <= this.value)
         {
            level = uint(level + (1));
            if(Experience.config.get(level) == null)
            {
               num = Number(Number(Experience.config.get(level - 1)["XP"]));
               num = Number(num + (num / 2));
               Experience.config.set(level, {"XP":Math.round(num)});
            }
         }
         if(level != this.level)
         {
            this.stats.leveling(level);
            this.level = uint(level);
         }
      }
  getUpperBound() {
         var num = Number(0);
         if(this.level > 1)
         {
            num = Number(Number(Experience.config.get(this.level - 1)["XP"]));
         }
         return Number(Experience.config.get(this.level)["XP"] - num);
      }
  modifyValue(num) { num = Number(num);
         super.modifyValue(num);
         this.refreshLevel();
      }
  getValue() {
         var num = Number(0);
         if(this.level > 1)
         {
            num = Number(Number(Experience.config.get(this.level - 1)["XP"]));
         }
         return Number(this.value - num);
      }
  getLevel() {
         return uint(this.level);
      }
}
Experience.prototype.level = 0;
Experience.prototype.stats = null;
bindMethods(Experience);
