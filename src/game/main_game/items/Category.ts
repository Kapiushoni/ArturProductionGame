import { bindMethods } from '@/flash/as3';
import type { Item } from '@/game/main_game/items/Item';
import type { ItemContainer } from '@/game/main_game/item_containers/ItemContainer';

/** What kind of item it is (decides where it can be put). Subclasses: Shield, Equipment, Weapon, Consumable. */
export class Category {
  static SHIELD_CATEGORY = 'S';
  static EQUIPABLE_CATEGORY = 'E';
  static WEAPON_CATEGORY = 'W';
  static CONSUMABLE_CATEGORY = 'C';
  protected item: Item;

  constructor(item: Item, _config: any) {
    this.item = item;
  }
  get type(): string {
    throw new Error('Abstract class');
  }
  canBeContained(_itemContainer: ItemContainer): boolean {
    return true;
  }
  clear() {
    this.item = null;
  }
}
bindMethods(Category, ['clear']);
