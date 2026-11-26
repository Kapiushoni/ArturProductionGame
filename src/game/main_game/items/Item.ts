// @ts-nocheck
import { as3values, bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Element } from '@/game/main_game/element/Element';
import { Category } from '@/game/main_game/items/Category';
import { Consumable } from '@/game/main_game/items/Consumable';
import { Equipment } from '@/game/main_game/items/Equipment';
import { HealthModifier } from '@/game/main_game/items/modifiers/HealthModifier';
import { MaxHealthModifier } from '@/game/main_game/items/modifiers/MaxHealthModifier';
import { Modifier } from '@/game/main_game/items/modifiers/Modifier';
import { NullModifier } from '@/game/main_game/items/modifiers/NullModifier';
import { Shield } from '@/game/main_game/items/Shield';
import { Weapon } from '@/game/main_game/items/Weapon';

export class Item {
  declare id: any;
  declare name: any;
  declare mc_name: any;
  declare maxMod: any;
  declare mix_time: any;
  declare primaryModifier: any;
  declare secondaryModifier: any;
  declare element: any;
  declare category: any;
  declare duration: any;
  constructor(id, obj) {
         
         this.id = id;
         this.name = obj.NameString;
         this.mc_name = obj.MovieClip;
         this.mix_time = Number(obj.MixTime);
         this.maxMod = int(obj.MaxMod);
         this.duration = int(obj.Duration);
         this.primaryModifier = this.createModifier(obj.FirstModifier);
         this.secondaryModifier = this.createModifier(obj.SecondModifier);
         this.element = Element.parseElement(obj.Element);
         switch(obj.Category)
         {
            case Category.EQUIPABLE_CATEGORY:
               this.category = new Equipment(this,obj);
               break;
            case Category.CONSUMABLE_CATEGORY:
               this.category = new Consumable(this,obj);
               break;
            case Category.WEAPON_CATEGORY:
               this.category = new Weapon(this,obj);
               break;
            case Category.SHIELD_CATEGORY:
               this.category = new Shield(this,obj);
               break;
            default:
               throw new Error("Unknown type");
         }
      }
  getMcName() {
         return this.mc_name;
      }
  getMaxMod() {
         return int(this.maxMod);
      }
  getDuration() {
         return int(this.duration);
      }
  createModifier(obj) {
         var modifier = null;
         var num = int(StatType.parse(obj.Category));
         if(num == StatType.MAX_HP)
         {
            modifier = new MaxHealthModifier(obj);
         }
         else if(num == StatType.HEALTH)
         {
            modifier = new HealthModifier(obj);
         }
         else if(StatType.getStatTypes().indexOf(num) >= 0)
         {
            modifier = new Modifier(obj);
         }
         else
         {
            modifier = new NullModifier();
         }
         return modifier;
      }
  getID() {
         return this.id;
      }
  getNameToShow() {
         var loc1_Item = null;
         var list = this.name.split(";");
         var text = "";
         for (loc1_Item of as3values(list))
         {
            if(text != "")
            {
               text += " ";
            }
            text += main.locale.get(loc1_Item);
         }
         return text;
      }
  getPrimaryModifier() {
         return this.primaryModifier;
      }
  getSecondaryModifier() {
         return this.secondaryModifier;
      }
  canBeContained(itemContainer) {
         return this.category.canBeContained(itemContainer);
      }
  clear() {
         this.getCategory().clear();
         this.element.clear();
         this.primaryModifier.clear();
         this.secondaryModifier.clear();
      }
  getCategory() {
         return this.category;
      }
  getMixTime() {
         return Number(this.mix_time);
      }
  getElement() {
         return this.element;
      }
  toObject() {
         return {"id":this.id};
      }
}
Item.prototype.id = null;
Item.prototype.name = null;
Item.prototype.mc_name = null;
Item.prototype.maxMod = 0;
Item.prototype.mix_time = NaN;
Item.prototype.primaryModifier = null;
Item.prototype.secondaryModifier = null;
Item.prototype.element = null;
Item.prototype.category = null;
Item.prototype.duration = 0;
bindMethods(Item);
