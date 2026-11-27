import { bindMethods } from '@/flash/as3';
import { BasicSlotView } from '@/game/view/screens/main_game/slot/BasicSlotView';

export class SlotView extends BasicSlotView {
  static EMPTY = 'empty';
  static EQUIPMENT = 'equipment';
  static WEAPONS = 'weapons';
  static CONSUMABLE = 'consumables';
  constructor(slot) {
    super(slot);
  }
  updateState(itemView) {
    if (itemView == null || this.hide) {
      this.bg.slot.gotoAndStop(SlotView.EMPTY);
    } else {
      this.bg.slot.gotoAndStop(itemView.getStateForSlot(this));
    }
  }
}
bindMethods(SlotView);
