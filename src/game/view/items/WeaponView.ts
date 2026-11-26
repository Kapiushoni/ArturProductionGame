// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class WeaponView extends ItemView {
  constructor(item) {
          super(item);
      }
  getMC() { const __self = this;
         var mc = super.getMC();
         __self.item.getSecondaryModifier().modifyIcon(mc.sword.gem);
         return mc;
      }
  getStateForSlot(slotView) {
         return SlotView.WEAPONS;
      }
}
bindMethods(WeaponView);
