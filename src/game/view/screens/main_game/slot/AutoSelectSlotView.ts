import { bindMethods } from '@/flash/as3';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import { DragListener } from '@/game/drag_and_drop/DragListener';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { MouseEvent } from '@/flash/as3';

export class AutoSelectSlotView extends SlotView {
  constructor(slot: ISlot) {
    super(slot);
  }
  startDrag(dragListener: DragListener) {
    super.startDrag(dragListener);
    this.popUp.hide();
    if (dragListener.isInState(DragListener.ACTIVE_DRAG)) {
      this.select();
    }
  }
  mouseOut(event: MouseEvent) {
    if (this.drag_listener.isInState(DragListener.NO_DRAG)) {
      super.mouseOut(event);
    }
  }
}
bindMethods(AutoSelectSlotView, ['startDrag', 'mouseOut']);
