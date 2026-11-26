// @ts-nocheck
import { as3as, bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { Enemy } from '@/game/main_game/character/Enemy';
import { Jinn } from '@/game/main_game/character/Jinn';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Damage } from '@/game/main_game/dungeon/Damage';
import { ElementBonus } from '@/game/main_game/dungeon/ElementBonus';
import { Element } from '@/game/main_game/element/Element';

export class DamageCalculator {
  constructor() {
         
      }
  static calculateDamage(fighter, fighter2) {
         var element = null;
         var type = null;
         var content = null;
         var type2 = null;
         var type3 = null;
         var weapon = null;
         var num = Number(NaN);
         var flag = false;
         var flag2 = false;
         var flag3 = false;
         var luck = Number(fighter.stats.getLuck());
         var luck2 = Number(fighter2.stats.getLuck());
         var num2 = Number(fighter.stats.getLevel() + 1);
         var num3 = Number(fighter2.stats.getLevel() + 1);
         var value = main.config.get("Damage");
         var list = value["VariableAttackPercentage"].split(":");
         list[0] = Number(list[0]) / 100;
         list[1] = Number(list[1]) / 100;
         var num4 = Number(Number(value["CriticalMultiplier"]));
         var num5 = Number(Number(value["EvadeFactor"]));
         var num6 = Number(Number(value["CriticalFactor"]));
         var num7 = Number(value["MinimumCritical"] / 100);
         var num8 = Number(value["MinimumEvade"] / 100);
         var num9 = Number(value["LuckCap"] / 100);
         var num10 = Number(0);
         if(luck < luck2)
         {
            num10 = Number(Math.max(num8,Math.min(num9,num5 * (1 - luck / luck2))));
         }
         flag2 = Math.random() < num10;
         var num11 = Number(1);
         if(fighter2.isJinn())
         {
            content = (as3as(fighter2, Jinn)).gear.shield.getContent();
            type2 = "N";
            if(content != null)
            {
               type2 = content.getElement().type;
            }
            element = (as3as(fighter, Enemy)).getElement();
            type = element.type;
            num11 = Number(Number(value[type2 + "vs" + type + "_defence"]));
            if(type2 + type == Element.FIRE + Element.ICE || type2 + type == Element.ICE + Element.FIRE)
            {
               flag3 = true;
            }
         }
         else if(fighter.isJinn())
         {
            type = (as3as(fighter2, Enemy)).getElement().type;
            type3 = "N";
            weapon = (as3as(fighter, Jinn)).gear.weapon;
            if(!weapon.isEmpty())
            {
               element = weapon.getContent().getElement();
               type3 = element.type;
               num = Number(0);
               if(luck > luck2)
               {
                  num = Number(Math.max(num7,Math.min(num9,num6 * (1 - luck2 / luck))));
               }
               flag = Math.random() < num;
            }
            num11 = Number(Number(value[type3 + "vs" + type + "_attack"]));
            if(type3 + type == Element.FIRE + Element.ICE || type3 + type == Element.ICE + Element.FIRE)
            {
               flag3 = true;
            }
         }
         var value2 = int(fighter.stats.getStat(StatType.ATTACK).getValue());
         var value3 = int(fighter2.stats.getStat(StatType.DEFENSE).getValue());
         var num12 = Number((value2 - value3) * num11);
         num12 = Number(num12 - (num12 * list[0]));
         var num13 = Number(list[0] + list[1]);
         num13 = Number(num13 * Math.random());
         num12 = Number(num12 + (num12 * num13));
         var num14 = int(Math.max(1,Math.round(num12)));
         if(flag2)
         {
            num14 = int(0);
         }
         else if(flag)
         {
            num14 = int(num14 * (num4));
         }
         var elementBonus = null;
         if(flag3)
         {
            elementBonus = new ElementBonus(element,num11);
         }
         return new Damage(num14,!flag2,flag,fighter2,elementBonus);
      }
}
bindMethods(DamageCalculator);
