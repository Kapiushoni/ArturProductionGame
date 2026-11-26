// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class EquipmentView extends ItemView {
  constructor(item) {
          super(item);
      }
  getMC() { const __self = this;
         var mc = super.getMC();
         if(mc.hasOwnProperty("equip"))
         {
            __self.item.getPrimaryModifier().modifyIcon(mc.equip.gem1);
            __self.item.getSecondaryModifier().modifyIcon(mc.equip.gem2);
         }
         return mc;
      }
  getStateForSlot(slotView) {
         return SlotView.EQUIPMENT;
      }
}
bindMethods(EquipmentView);
