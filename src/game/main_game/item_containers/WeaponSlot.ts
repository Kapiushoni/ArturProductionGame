import { bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';

/** The weapon slot. */
export class WeaponSlot extends Slot {
  canContainConsumable(): boolean {
    return false;
  }
  canContainEquipment(): boolean {
    return false;
  }
  canContainShield(): boolean {
    return false;
  }
}
bindMethods(WeaponSlot);
