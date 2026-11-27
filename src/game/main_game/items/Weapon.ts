import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';

/** A weapon (goes into the weapon slot). */
export class Weapon extends Category {
  get type(): string {
    return Category.WEAPON_CATEGORY;
  }
  canBeContained(itemContainer: any): boolean {
    return itemContainer.canContainWeapon();
  }
}
bindMethods(Weapon);
