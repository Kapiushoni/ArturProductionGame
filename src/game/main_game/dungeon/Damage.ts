// @ts-nocheck
import { MovieClip, as3as, bindMethods, int, uint } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class Damage {
  declare hp_damage: any;
  declare hit: any;
  declare critical: any;
  declare target: any;
  declare elementBonus: any;
  constructor(hp_damage, hit, critical, target, elementBonus = null) { hp_damage = uint(hp_damage);
         
         this.hp_damage = uint(hp_damage);
         this.hit = hit;
         this.critical = critical;
         this.target = target;
         this.elementBonus = elementBonus;
      }
  apply(stats) {
         stats.downHP(this.hp_damage);
      }
  getHitterFeedback() {
         var clip = null;
         var list = [];
         if(this.isCritical())
         {
            clip = as3as(main.swfLoader.getObject("assets.criticalHit"), MovieClip);
            clip.number_heathl_parts_blocked.title.title.text = main.locale.get("critical_bonus");
            list.push(clip);
         }
         if(Boolean(this.doesHeHit()) && Boolean(this.elementBonus) && this.elementBonus.value > 1)
         {
            if(this.elementBonus.element.isOfFire)
            {
               clip = as3as(main.swfLoader.getObject("assets.elementBonus_fire"), MovieClip);
            }
            else if(this.elementBonus.element.isOfIce)
            {
               clip = as3as(main.swfLoader.getObject("assets.elementBonus_ice"), MovieClip);
            }
            clip.number_heathl_parts_blocked.title.title.text = main.locale.get("element_bonus",[int(this.elementBonus.value * 100)]);
            list.push(clip);
         }
         return list;
      }
  getDefenderFeedback() {
         var clip = null;
         var list = [];
         if(!this.doesHeHit())
         {
            clip = as3as(main.swfLoader.getObject("assets.blocked"), MovieClip);
            clip.number_heathl_parts_blocked.title.title.text = main.locale.get("evade_bonus");
            list.push(clip);
         }
         else if(Boolean(this.elementBonus) && this.elementBonus.value < 1)
         {
            if(this.elementBonus.element.isOfFire)
            {
               clip = as3as(main.swfLoader.getObject("assets.elementBonus_fire"), MovieClip);
            }
            else if(this.elementBonus.element.isOfIce)
            {
               clip = as3as(main.swfLoader.getObject("assets.elementBonus_ice"), MovieClip);
            }
            clip.number_heathl_parts_blocked.title.title.text = main.locale.get("element_bonus",[int((2 - this.elementBonus.value) * 100)]);
         }
         return list;
      }
  doesHeDie() {
         return this.doesHeHit() && this.target.stats.getStat(StatType.HEALTH).getValue() <= this.hp_damage;
      }
  doesHeHit() {
         return this.hit;
      }
  isCritical() {
         return this.critical;
      }
  stringValue() {
         return this.hp_damage.toString();
      }
}
Damage.prototype.hp_damage = 0;
Damage.prototype.hit = false;
Damage.prototype.critical = false;
Damage.prototype.target = null;
Damage.prototype.elementBonus = null;
bindMethods(Damage);
