// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { ItemView } from '@/game/view/items/ItemView';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class ConsumableView extends ItemView {
  constructor(item) {
          super(item);
      }
  getMC() { const __self = this;
         var mc = super.getMC();
         if(mc.potion.hasOwnProperty("liquid1"))
         {
            __self.item.getPrimaryModifier().modifyIcon(mc.potion.liquid1);
         }
         if(mc.potion.hasOwnProperty("liquid2"))
         {
            __self.item.getSecondaryModifier().modifyIcon(mc.potion.liquid2);
         }
         return mc;
      }
  getStateForSlot(slotView) {
         return SlotView.CONSUMABLE;
      }
}
bindMethods(ConsumableView);
