// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';

export class ShieldSlot extends Slot {
  constructor() {super(__DEFER); 
          this.__init_Slot();
      }
  canContainConsumable() {
         return false;
      }
  canContainEquipment() {
         return false;
      }
  canContainWeapon() {
         return false;
      }
}
bindMethods(ShieldSlot);
