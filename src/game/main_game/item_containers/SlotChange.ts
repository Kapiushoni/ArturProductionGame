// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class SlotChange {
  declare slot: any;
  declare old_item: any;
  declare new_item: any;
  constructor(slot, old_item, new_item) {
         
         this.slot = slot;
         this.old_item = old_item;
         this.new_item = new_item;
      }
  getSlot() {
         return this.slot;
      }
  getOldItem() {
         return this.old_item;
      }
  getNewItem() {
         return this.new_item;
      }
}
SlotChange.prototype.slot = null;
SlotChange.prototype.old_item = null;
SlotChange.prototype.new_item = null;
bindMethods(SlotChange);
