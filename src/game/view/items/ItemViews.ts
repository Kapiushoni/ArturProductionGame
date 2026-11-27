import { Category } from '@/game/main_game/items/Category';
import { ConsumableView } from '@/game/view/items/ConsumableView';
import { EquipmentView } from '@/game/view/items/EquipmentView';
import { NullShieldModifier } from '@/game/view/items/modifiers/NullShieldModifier';
import { NullSwordModifier } from '@/game/view/items/modifiers/NullSwordModifier';
import { ShieldModifier } from '@/game/view/items/modifiers/ShieldModifier';
import { SwordModifier } from '@/game/view/items/modifiers/SwordModifier';
import { ShieldView } from '@/game/view/items/ShieldView';
import { WeaponView } from '@/game/view/items/WeaponView';
import type { Item } from '@/game/main_game/items/Item';

/** Views of items (moved here from ItemFactory: the game logic does not create views). */
export class ItemViews {
  /** the view of an item, by its category */
  static create(item: Item): any {
    switch (item.getCategory().type) {
      case Category.EQUIPABLE_CATEGORY:
        return new EquipmentView(item);
      case Category.CONSUMABLE_CATEGORY:
        return new ConsumableView(item);
      case Category.WEAPON_CATEGORY:
        return new WeaponView(item);
      case Category.SHIELD_CATEGORY:
        return new ShieldView(item);
      default:
        throw new Error('Unknown type');
    }
  }
  /** how the equipped shield looks on the jinn */
  static shieldModifier(item: Item | null): any {
    if (item == null) {
      return new NullShieldModifier();
    }
    return new ShieldModifier(item.getMcName(), item.secondaryModifier.toObject().Category);
  }
  /** how the equipped weapon looks on the jinn */
  static swordModifier(item: Item | null): any {
    if (item == null) {
      return new NullSwordModifier();
    }
    return new SwordModifier(item.getMcName(), item.secondaryModifier.toObject().Category);
  }
}
