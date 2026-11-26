// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BasicSlotView } from '@/game/view/screens/main_game/slot/BasicSlotView';

export class SlotView extends BasicSlotView {
  static EMPTY = "empty";
  static EQUIPMENT = "equipment";
  static WEAPONS = "weapons";
  static CONSUMABLE = "consumables";
  constructor(slot) {
          super(slot);
      }
  updateState(itemView) { const __self = this;
         if(itemView == null || __self.hide)
         {
            __self.bg.slot.gotoAndStop(SlotView.EMPTY);
         }
         else
         {
            __self.bg.slot.gotoAndStop(itemView.getStateForSlot(this));
         }
      }
}
bindMethods(SlotView);
