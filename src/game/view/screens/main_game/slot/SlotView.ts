import { BasicSlotView } from '@/game/view/screens/main_game/slot/BasicSlotView';
import { SlotStates } from '@/game/view/screens/main_game/slot/SlotStates';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { ItemView } from '@/game/view/items/ItemView';

export class SlotView extends BasicSlotView {
  static EMPTY = SlotStates.EMPTY;
  static EQUIPMENT = SlotStates.EQUIPMENT;
  static WEAPONS = SlotStates.WEAPONS;
  static CONSUMABLE = SlotStates.CONSUMABLE;
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
