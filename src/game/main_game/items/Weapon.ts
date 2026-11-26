// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';

export class Weapon extends Category {
  constructor(item, obj) {
          super(item,obj);
      }
  get type() {
         return Category.WEAPON_CATEGORY;
      }
  canBeContained(itemContainer) {
         return itemContainer.canContainWeapon();
      }
}
bindMethods(Weapon);
