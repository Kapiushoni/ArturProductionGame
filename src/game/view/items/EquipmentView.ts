import { bindMethods } from '@/flash/as3';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class EquipmentView extends ItemView {
  constructor(item) {
    super(item);
  }
  getMC() {
    var mc = super.getMC();
    if (mc.hasOwnProperty('equip')) {
      this.item.getPrimaryModifier().modifyIcon(mc.equip.gem1);
      this.item.getSecondaryModifier().modifyIcon(mc.equip.gem2);
    }
    return mc;
  }
  getStateForSlot(slotView) {
    return SlotView.EQUIPMENT;
  }
}
bindMethods(EquipmentView);
