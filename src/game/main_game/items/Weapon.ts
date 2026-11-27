import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';
import type { ItemContainer } from '@/game/main_game/item_containers/ItemContainer';

/** A weapon (goes into the weapon slot). */
export class Weapon extends Category {
  get type(): string {
    return Category.WEAPON_CATEGORY;
  }
  canBeContained(itemContainer: ItemContainer): boolean {
    return itemContainer.canContainWeapon();
  }
}
bindMethods(Weapon);
