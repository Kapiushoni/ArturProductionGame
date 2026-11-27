import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';

/** A shield (goes into the shield slot). */
export class Shield extends Category {
  get type(): string {
    return Category.SHIELD_CATEGORY;
  }
  canBeContained(itemContainer: any): boolean {
    return itemContainer.canContainShield();
  }
}
bindMethods(Shield);
