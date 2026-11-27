import { bindMethods, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { EquipmentSlot } from '@/game/main_game/item_containers/EquipmentSlot';
import { ShieldSlot } from '@/game/main_game/item_containers/ShieldSlot';
import { WeaponSlot } from '@/game/main_game/item_containers/WeaponSlot';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';
import type { Fighter } from '@/game/main_game/character/Fighter';

/**
 * The jinn's equipment: weapon, shield and two equipment slots (saved as gear slots 1-4).
 * Equipping applies the item's modifiers to the stats; gear is locked inside dungeons.
 */
export class Gear {
  private locked = false;
  private fighter: Fighter; // Jinn
  weapon: WeaponSlot;
  shield: ShieldSlot;
  equipment_1: EquipmentSlot;
  equipment_2: EquipmentSlot;

  constructor(fighter: Fighter) {
    this.fighter = fighter;
    this.weapon = new WeaponSlot();
    this.shield = new ShieldSlot();
    this.equipment_1 = new EquipmentSlot();
    this.equipment_2 = new EquipmentSlot();
    for (const slot of this.slots()) {
      slot.onChange.add(this.change);
    }
    this.loadData();
  }
  private slots() {
    return [this.weapon, this.shield, this.equipment_1, this.equipment_2];
  }
  /** loads the saved gear, then saves every later change */
  loadData() {
    this.slots().forEach((slot, i) => {
      const saveId = i + 1;
      const item = services.saveSystem.loadGearItem(saveId);
      if (item != null) {
        slot.add(item);
      }
      slot.onChange.add(this.saveSlot(saveId));
    });
  }
  saveSlot(saveId: number) {
    const id = uint(saveId);
    return (change: SlotChange) => {
      services.saveSystem.saveGear(id, change.getNewItem());
    };
  }
  /** swaps the modifiers of the old item for the new one's */
  change(change: SlotChange) {
    const guardian = this.fighter.stats.getEffectGuardian();
    guardian.removeEfectsOfItem(change.getOldItem());
    guardian.addEfectsOfItem(change.getNewItem());
  }
  lock() {
    if (this.locked) {
      return;
    }
    this.locked = true;
    for (const slot of this.slots()) {
      slot.lock();
    }
  }
  unlock() {
    if (!this.locked) {
      return;
    }
    this.locked = false;
    for (const slot of this.slots()) {
      slot.unlock();
    }
  }
  clear() {
    this.equipment_1.clear();
    this.equipment_1 = null;
    this.equipment_2.clear();
    this.equipment_2 = null;
    this.fighter = null;
    this.shield.clear();
    this.shield = null;
    this.weapon.clear();
    this.weapon = null;
  }
}
bindMethods(Gear, ['slots', 'change', 'lock', 'unlock', 'clear']);
