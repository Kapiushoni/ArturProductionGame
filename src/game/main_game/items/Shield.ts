// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';

export class Shield extends Category {
  constructor(item, obj) {
          super(item,obj);
      }
  get type() {
         return Category.SHIELD_CATEGORY;
      }
  canBeContained(itemContainer) {
         return itemContainer.canContainShield();
      }
}
bindMethods(Shield);
