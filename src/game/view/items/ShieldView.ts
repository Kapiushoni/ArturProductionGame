import { bindMethods } from '@/flash/as3';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class ShieldView extends ItemView {
  constructor(item) {
    super(item);
  }
  getMC() {
    var mc = super.getMC();
    this.item.getSecondaryModifier().modifyIcon(mc.sword.gem);
    return mc;
  }
  getStateForSlot(slotView) {
    return SlotView.WEAPONS;
  }
}
bindMethods(ShieldView);
