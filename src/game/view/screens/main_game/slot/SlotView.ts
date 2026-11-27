import { bindMethods } from '@/flash/as3';
import { BasicSlotView } from '@/game/view/screens/main_game/slot/BasicSlotView';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { ItemView } from '@/game/view/items/ItemView';

export class SlotView extends BasicSlotView {
  static EMPTY = 'empty';
  static EQUIPMENT = 'equipment';
  static WEAPONS = 'weapons';
  static CONSUMABLE = 'consumables';
  constructor(slot: ISlot) {
    super(slot);
  }
  updateState(itemView: ItemView) {
    if (itemView == null || this.hide) {
      this.bg.slot.gotoAndStop(SlotView.EMPTY);
    } else {
      this.bg.slot.gotoAndStop(itemView.getStateForSlot(this));
    }
  }
}
bindMethods(SlotView);
