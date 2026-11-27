import { Category } from '@/game/main_game/items/Category';
import type { ItemContainer } from '@/game/main_game/item_containers/ItemContainer';

/** A shield (goes into the shield slot). */
export class Shield extends Category {
  get type(): string {
    return Category.SHIELD_CATEGORY;
  }
  canBeContained(itemContainer: ItemContainer): boolean {
    return itemContainer.canContainShield();
  }
}
