import { Category } from '@/game/main_game/items/Category';
import type { ItemContainer } from '@/game/main_game/item_containers/ItemContainer';

/** Equipment that is not a weapon or a shield. */
export class Equipment extends Category {
  get type(): string {
    return Category.EQUIPABLE_CATEGORY;
  }
  canBeContained(itemContainer: ItemContainer): boolean {
    return itemContainer.canContainEquipment();
  }
}
