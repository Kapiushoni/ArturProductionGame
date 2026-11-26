// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { main } from '@/game/main';
import { EquipmentSlot } from '@/game/main_game/item_containers/EquipmentSlot';
import { ShieldSlot } from '@/game/main_game/item_containers/ShieldSlot';
import { WeaponSlot } from '@/game/main_game/item_containers/WeaponSlot';

export class Gear {
  declare locked: any;
  declare fighter: any;
  declare weapon: any;
  declare shield: any;
  declare equipment_1: any;
  declare equipment_2: any;
  constructor(fighter) {
         
         this.fighter = fighter;
         this.locked = false;
         this.weapon = new WeaponSlot();
         this.shield = new ShieldSlot();
         this.equipment_1 = new EquipmentSlot();
         this.equipment_2 = new EquipmentSlot();
         this.weapon.onChange.add(this.change);
         this.shield.onChange.add(this.change);
         this.equipment_1.onChange.add(this.change);
         this.equipment_2.onChange.add(this.change);
         this.loadData();
      }
  loadData() {
         var item = null;
         item = main.saveSystem.loadGearItem(1);
         if(item != null)
         {
            this.weapon.add(item);
         }
         this.weapon.onChange.add(this.saveSlot(1));
         item = main.saveSystem.loadGearItem(2);
         if(item != null)
         {
            this.shield.add(item);
         }
         this.shield.onChange.add(this.saveSlot(2));
         item = main.saveSystem.loadGearItem(3);
         if(item != null)
         {
            this.equipment_1.add(item);
         }
         this.equipment_1.onChange.add(this.saveSlot(3));
         item = main.saveSystem.loadGearItem(4);
         if(item != null)
         {
            this.equipment_2.add(item);
         }
         this.equipment_2.onChange.add(this.saveSlot(4));
      }
  saveSlot(num) { num = uint(num);
         var i = uint(num);
         return function(slotChange)
         {
            main.saveSystem.saveGear(i,slotChange.getNewItem());
         };
      }
  change(slotChange) {
         var effectGuardian = this.fighter.stats.getEffectGuardian();
         effectGuardian.removeEfectsOfItem(slotChange.getOldItem());
         effectGuardian.addEfectsOfItem(slotChange.getNewItem());
      }
  lock() {
         if(this.locked)
         {
            return;
         }
         this.locked = true;
         this.weapon.lock();
         this.shield.lock();
         this.equipment_1.lock();
         this.equipment_2.lock();
      }
  unlock() {
         if(!this.locked)
         {
            return;
         }
         this.locked = false;
         this.weapon.unlock();
         this.shield.unlock();
         this.equipment_1.unlock();
         this.equipment_2.unlock();
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
Gear.prototype.locked = false;
Gear.prototype.fighter = null;
Gear.prototype.weapon = null;
Gear.prototype.shield = null;
Gear.prototype.equipment_1 = null;
Gear.prototype.equipment_2 = null;
bindMethods(Gear);
