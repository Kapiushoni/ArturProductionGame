// @ts-nocheck
import { as3as, bindMethods, int } from '@/flash/as3';
import { Modifier } from '@/game/main_game/items/modifiers/Modifier';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class MaxHealthModifier extends Modifier {
  declare primary_char: any;
  constructor(obj) {
          super(obj);
         if(this.characteristic == StatType.MAX_HP)
         {
            this.primary_char = int(StatType.HEALTH);
         }
         else if(this.characteristic == StatType.MAX_XP)
         {
            this.primary_char = int(StatType.EXPERIENCE);
         }
      }
  modifyIcon(clip) { const __self = this;
         super.modifyIcon(clip);
         if(clip.max_health)
         {
            if(__self.value >= 0)
            {
               clip.max_health.gotoAndStop("up");
            }
            else
            {
               clip.max_health.gotoAndStop("down");
            }
         }
      }
  affect(stats) {
         var healthStat = as3as(stats.getStat(this.primary_char), HealthStat);
         healthStat.modifyUpperBound(this.value);
      }
  disaffect(stats) {
         var healthStat = as3as(stats.getStat(this.primary_char), HealthStat);
         healthStat.modifyUpperBound(-this.value);
      }
  getStat(stats) {
         return (as3as(stats.getStat(this.primary_char), HealthStat)).getUpperBound();
      }
}
MaxHealthModifier.prototype.primary_char = 0;
bindMethods(MaxHealthModifier);
