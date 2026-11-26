// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import { DragListener } from '@/game/drag_and_drop/DragListener';

export class AutoSelectSlotView extends SlotView {
  constructor(slot) {
          super(slot);
      }
  startDrag(dragListener) { const __self = this;
         super.startDrag(dragListener);
         __self.popUp.hide();
         if(dragListener.isInState(DragListener.ACTIVE_DRAG))
         {
            __self.select();
         }
      }
  mouseOut(event) { const __self = this;
         if(__self.drag_listener.isInState(DragListener.NO_DRAG))
         {
            super.mouseOut(event);
         }
      }
}
bindMethods(AutoSelectSlotView);
