// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';

export class EquipmentSlot extends Slot {
  constructor() {super(__DEFER); 
          this.__init_Slot();
      }
  canContainConsumable() {
         return false;
      }
  canContainWeapon() {
         return false;
      }
  canContainShield() {
         return false;
      }
}
bindMethods(EquipmentSlot);
