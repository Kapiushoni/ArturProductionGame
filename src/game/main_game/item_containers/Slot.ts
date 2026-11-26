// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { assert } from '@/game/assert';
import { Signal } from '@/game/cb/signals/Signal';
import { SlotChange } from '@/game/main_game/item_containers/SlotChange';

export class Slot {
  declare onChangeSignal: any;
  declare content: any;
  declare locked: any;
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_Slot(...__a); }
  __init_Slot() {
         
         this.locked = false;
         this.onChangeSignal = new Signal();
      }
  get onChange() {
         return this.onChangeSignal;
      }
  moveFrom(item, dragContainer) {
         var content = null;
         if(!this.isEmpty())
         {
            content = this.getContent();
            this.remove(content);
         }
         dragContainer.remove(item);
         this.add(item);
         if(content != null)
         {
            dragContainer.add(content);
         }
      }
  add(content) {
         var slotChange = new SlotChange(this,this.content,content);
         if(this.content != content)
         {
            this.content = content;
            this.onChange.emit(slotChange);
         }
      }
  getContainToDrag() {
         if(this.isEmpty() || this.isLocked() || !this.canRemove(this.getContent()))
         {
            return null;
         }
         return this.getContent();
      }
  remove(item) {
         assert(this.content == item,"The content its not present");
         this.empty();
      }
  empty() {
         var slotChange = new SlotChange(this,this.content,null);
         if(this.content != null)
         {
            this.content = null;
            this.onChange.emit(slotChange);
         }
      }
  isEmpty() {
         return this.content == null;
      }
  lock() {
         this.locked = true;
      }
  unlock() {
         this.locked = false;
      }
  isLocked() {
         return this.locked;
      }
  getContent() {
         return this.content;
      }
  canRemove(item) {
         return !this.isLocked() && item == this.getContent();
      }
  canMoveFrom(item, dragContainer) {
         return !this.isLocked() && (this.isEmpty() || dragContainer.canSwap(this)) && this.itsCompatible(item,dragContainer);
      }
  itsCompatible(item, dragContainer) {
         return item.canBeContained(this);
      }
  canSwap(dragContainer) {
         if(dragContainer == this)
         {
            return false;
         }
         var containToDrag = dragContainer.getContainToDrag();
         return containToDrag != null && containToDrag.canBeContained(this);
      }
  canContainEquipment() {
         return true;
      }
  canContainWeapon() {
         return true;
      }
  canContainConsumable() {
         return true;
      }
  canContainShield() {
         return true;
      }
  clear() {
         this.onChange.clear();
         this.onChangeSignal = null;
      }
}
Slot.prototype.onChangeSignal = null;
Slot.prototype.content = null;
Slot.prototype.locked = false;
bindMethods(Slot);
