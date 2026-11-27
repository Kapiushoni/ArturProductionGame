import { bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';

/** A gear slot for equipment (not weapons or shields). */
export class EquipmentSlot extends Slot {
  canContainConsumable(): boolean {
    return false;
  }
  canContainWeapon(): boolean {
    return false;
  }
  canContainShield(): boolean {
    return false;
  }
}
bindMethods(EquipmentSlot);
