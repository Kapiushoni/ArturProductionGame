import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotStates } from '@/game/view/screens/main_game/slot/SlotStates';
import type { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { Item } from '@/game/main_game/items/Item';

export class EquipmentView extends ItemView {
  constructor(item: Item) {
    super(item);
  }
  getMC() {
    const mc = super.getMC();
    if (mc.hasOwnProperty('equip')) {
      ModifierIcons.show(this.item.primaryModifier, mc.equip.gem1);
      ModifierIcons.show(this.item.secondaryModifier, mc.equip.gem2);
    }
    return mc;
  }
  getStateForSlot(slotView: SlotView) {
    return SlotStates.EQUIPMENT;
  }
}
