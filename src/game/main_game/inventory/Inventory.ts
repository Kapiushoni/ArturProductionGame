// @ts-nocheck
import { as3as, as3values, bindMethods, uint } from '@/flash/as3';
import { main } from '@/game/main';
import { Trash } from '@/game/main_game/inventory/Trash';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { Item } from '@/game/main_game/items/Item';

export class Inventory {
  static SLOTS = uint(12);
  declare slots: any;
  declare trash: any;
  constructor() {
         
         this.trash = new Trash();
         this.slots = new Array(Inventory.SLOTS);
         var i = uint(0);
         while(i < Inventory.SLOTS)
         {
            this.slots[i] = new Slot();
            i++;
         }
         this.loadData();
      }
  loadData() {
         var item = null;
         var i = uint(0);
         while(i < Inventory.SLOTS)
         {
            item = main.saveSystem.loadInventoryItem(i);
            if(item != null)
            {
               this.slots[i].add(item);
            }
            this.slots[i].onChange.add(this.saveSlot(i));
            i++;
         }
      }
  saveSlot(num) { num = uint(num);
         var i = uint(num);
         return function(slotChange)
         {
            main.saveSystem.saveInventorySlot(i,slotChange.getNewItem());
         };
      }
  getEmptySlot() {
         var slot = null;
         for (slot of as3values(this.slots))
         {
            if(slot.isEmpty())
            {
               return slot;
            }
         }
         return null;
      }
  getTrash() {
         return this.trash;
      }
  itemOfSlot(num) { num = uint(num);
         return as3as((as3as(this.slots[num], Slot)).getContent(), Item);
      }
  getSlot(num) { num = uint(num);
         return as3as(this.slots[num], Slot);
      }
  get fullSlots() {
         var slot = null;
         var num = uint(0);
         for (slot of as3values(this.slots))
         {
            if(!slot.isEmpty())
            {
               num++;
            }
         }
         return uint(num);
      }
  clear() {
         var slot = null;
         this.trash.clear();
         for (slot of as3values(this.slots))
         {
            slot.clear();
         }
      }
}
Inventory.prototype.slots = null;
Inventory.prototype.trash = null;
bindMethods(Inventory);
