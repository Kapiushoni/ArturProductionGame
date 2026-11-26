// @ts-nocheck
import { as3as, as3values, bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class XpCalculator {
  constructor() {
         
      }
  get config() {
         return main.config.get("ExperienceBonus");
      }
  getXp(list) {
         var param1Item = null;
         var num = int(0);
         for (param1Item of as3values(list))
         {
            num = int(num + (param1Item.stats.getStat(StatType.EXPERIENCE).getValue()));
         }
         return int(num);
      }
  get requiredExperience() {
         var experience = as3as(main.game.getJinn().stats.getStat(StatType.EXPERIENCE), Experience);
         return Number(experience.getUpperBound());
      }
  getMixXp(num) { num = int(num);
         return Number(Math.round(Number(num * this.requiredExperience * this.config.mix) / 100));
      }
  getCriticalXp(num) { num = int(num);
         return Number(Math.round(Number(num * this.requiredExperience * this.config.critical) / 100));
      }
}
bindMethods(XpCalculator);
