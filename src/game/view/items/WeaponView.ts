import { bindMethods } from '@/flash/as3';
import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { Item } from '@/game/main_game/items/Item';

export class WeaponView extends ItemView {
  constructor(item: Item) {
    super(item);
  }
  getMC() {
    var mc = super.getMC();
    ModifierIcons.show(this.item.getSecondaryModifier(), mc.sword.gem);
    return mc;
  }
  getStateForSlot(slotView: SlotView) {
    return SlotView.WEAPONS;
  }
}
bindMethods(WeaponView);
