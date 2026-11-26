// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';

export class MixSlot extends Slot {
  constructor() {super(__DEFER); 
          this.__init_Slot();
      }
  canMoveFrom(item, dragContainer) {
         return false;
      }
  canSwap(dragContainer) {
         return false;
      }
  itsCompatible(item, dragContainer) {
         return false;
      }
}
bindMethods(MixSlot);
