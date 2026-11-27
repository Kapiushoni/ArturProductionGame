import { bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';

/** The shield slot. */
export class ShieldSlot extends Slot {
  canContainConsumable(): boolean {
    return false;
  }
  canContainEquipment(): boolean {
    return false;
  }
  canContainWeapon(): boolean {
    return false;
  }
}
bindMethods(ShieldSlot);
