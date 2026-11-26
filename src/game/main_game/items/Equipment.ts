// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';

export class Equipment extends Category {
  constructor(item, obj) {
          super(item,obj);
      }
  get type() {
         return Category.EQUIPABLE_CATEGORY;
      }
  canBeContained(itemContainer) {
         return itemContainer.canContainEquipment();
      }
}
bindMethods(Equipment);
