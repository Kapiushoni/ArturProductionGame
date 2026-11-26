// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { main } from '@/game/main';

export class OneTimeSlot extends Slot {
  constructor(item) {super(__DEFER); 
          this.__init_Slot();
         this.add(item);
      }
  remove(item) {
         super.remove(item);
         main.saveSystem.savePendingItems();
      }
  canMoveFrom(item, dragContainer) {
         return false;
      }
  itsCompatible(item, dragContainer) {
         return false;
      }
  canSwap(dragContainer) {
         return false;
      }
}
bindMethods(OneTimeSlot);
