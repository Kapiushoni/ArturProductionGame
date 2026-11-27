import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotStates } from '@/game/view/screens/main_game/slot/SlotStates';
import type { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { Item } from '@/game/main_game/items/Item';

export class WeaponView extends ItemView {
  constructor(item: Item) {
    super(item);
  }
  getMC() {
    const mc = super.getMC();
    ModifierIcons.show(this.item.secondaryModifier, mc.sword.gem);
    return mc;
  }
  getStateForSlot(slotView: SlotView) {
    return SlotStates.WEAPONS;
  }
}
