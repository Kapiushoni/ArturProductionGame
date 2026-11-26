// @ts-nocheck
import { as3values, bindMethods, int } from '@/flash/as3';
import { AllFilter } from '@/game/bonus/filter/AllFilter';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { XpCalculator } from '@/game/main_game/dungeon/XpCalculator';

export class XpBonus {
  declare value: any;
  declare filter: any;
  declare xpCalculator: any;
  constructor(num = 100, filter = null) { num = Number(num);
         
         this.value = Number(num / 100);
         if(filter == null)
         {
            filter = new AllFilter();
         }
         this.filter = filter;
      }
  activate() {
         this.xpCalculator = new XpCalculator();
         Dungeon.xpCalulator = this;
      }
  getXp(list) {
         var param1Item = null;
         var value = int(0);
         var num = int(0);
         for (param1Item of as3values(list))
         {
            value = int(param1Item.stats.getStat(StatType.EXPERIENCE).getValue());
            if(this.filter.doesApply(param1Item.getElement()))
            {
               value = int(Math.ceil(value * this.value));
            }
            num = int(num + (value));
         }
         return int(num);
      }
  getMixXp(num) { num = int(num);
         return Number(this.xpCalculator.getMixXp(num));
      }
  getCriticalXp(num) { num = int(num);
         return Number(this.xpCalculator.getCriticalXp(num));
      }
  getIcon() {
         return BonusIcon.getXpIcon();
      }
  getFilter() {
         return this.filter;
      }
  getAction() {
         return BonusIcon.Kill;
      }
}
XpBonus.prototype.value = NaN;
XpBonus.prototype.filter = null;
XpBonus.prototype.xpCalculator = null;
bindMethods(XpBonus);
