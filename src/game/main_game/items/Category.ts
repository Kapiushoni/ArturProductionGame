// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class Category {
  static SHIELD_CATEGORY = "S";
  static EQUIPABLE_CATEGORY = "E";
  static WEAPON_CATEGORY = "W";
  static CONSUMABLE_CATEGORY = "C";
  declare item: any;
  constructor(item, obj) {
         
         this.item = item;
      }
  get type() {
         throw new Error("Abstract class");
      }
  canBeContained(itemContainer) {
         return true;
      }
  clear() {
         this.item = null;
      }
}
Category.prototype.item = null;
bindMethods(Category);
