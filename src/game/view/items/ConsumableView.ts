import { bindMethods } from '@/flash/as3';
import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { Item } from '@/game/main_game/items/Item';

export class ConsumableView extends ItemView {
  constructor(item: Item) {
    super(item);
  }
  getMC() {
    var mc = super.getMC();
    if (mc.potion.hasOwnProperty('liquid1')) {
      ModifierIcons.show(this.item.getPrimaryModifier(), mc.potion.liquid1);
    }
    if (mc.potion.hasOwnProperty('liquid2')) {
      ModifierIcons.show(this.item.getSecondaryModifier(), mc.potion.liquid2);
    }
    return mc;
  }
  getStateForSlot(slotView: SlotView) {
    return SlotView.CONSUMABLE;
  }
}
bindMethods(ConsumableView);
