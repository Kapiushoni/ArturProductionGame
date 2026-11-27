import { bindMethods } from '@/flash/as3';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import { DragListener } from '@/game/drag_and_drop/DragListener';

export class AutoSelectSlotView extends SlotView {
  constructor(slot) {
    super(slot);
  }
  startDrag(dragListener) {
    super.startDrag(dragListener);
    this.popUp.hide();
    if (dragListener.isInState(DragListener.ACTIVE_DRAG)) {
      this.select();
    }
  }
  mouseOut(event) {
    if (this.drag_listener.isInState(DragListener.NO_DRAG)) {
      super.mouseOut(event);
    }
  }
}
bindMethods(AutoSelectSlotView);
