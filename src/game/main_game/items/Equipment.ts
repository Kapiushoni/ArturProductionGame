import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';

/** Equipment that is not a weapon or a shield. */
export class Equipment extends Category {
  get type(): string {
    return Category.EQUIPABLE_CATEGORY;
  }
  canBeContained(itemContainer: any): boolean {
    return itemContainer.canContainEquipment();
  }
}
bindMethods(Equipment);
