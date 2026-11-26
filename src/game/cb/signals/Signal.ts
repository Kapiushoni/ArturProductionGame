// @ts-nocheck
import { as3values, bindMethods } from '@/flash/as3';
import { cbArray } from '@/game/cb/utils/cbArray';

export class Signal {
  slots = new cbArray();
  constructor() {
         
      }
  add(callback) {
         this.slots.push(callback);
      }
  addAtFirst(callback) {
         this.slots.unshift(callback);
      }
  emit(... rest) {
         var loc2_Item = null;
         var cbArray2 = this.slots.clone();
         for (loc2_Item of as3values(cbArray2))
         {
            loc2_Item.apply(null,rest);
         }
      }
  clear() {
         this.slots = new cbArray();
      }
  remove(callback) {
         this.slots.remove(callback);
      }
}
bindMethods(Signal);
