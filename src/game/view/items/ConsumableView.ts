import { bindMethods } from '@/flash/as3';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class ConsumableView extends ItemView {
  constructor(item) {
    super(item);
  }
  getMC() {
    var mc = super.getMC();
    if (mc.potion.hasOwnProperty('liquid1')) {
      this.item.getPrimaryModifier().modifyIcon(mc.potion.liquid1);
    }
    if (mc.potion.hasOwnProperty('liquid2')) {
      this.item.getSecondaryModifier().modifyIcon(mc.potion.liquid2);
    }
    return mc;
  }
  getStateForSlot(slotView) {
    return SlotView.CONSUMABLE;
  }
}
bindMethods(ConsumableView);
