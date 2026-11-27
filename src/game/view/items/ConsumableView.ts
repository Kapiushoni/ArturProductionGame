import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotStates } from '@/game/view/screens/main_game/slot/SlotStates';
import type { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { Item } from '@/game/main_game/items/Item';

export class ConsumableView extends ItemView {
  constructor(item: Item) {
    super(item);
  }
  getMC() {
    const mc = super.getMC();
    if (mc.potion.hasOwnProperty('liquid1')) {
      ModifierIcons.show(this.item.primaryModifier, mc.potion.liquid1);
    }
    if (mc.potion.hasOwnProperty('liquid2')) {
      ModifierIcons.show(this.item.secondaryModifier, mc.potion.liquid2);
    }
    return mc;
  }
  getStateForSlot(slotView: SlotView) {
    return SlotStates.CONSUMABLE;
  }
}
