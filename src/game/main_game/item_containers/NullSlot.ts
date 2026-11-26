// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class NullSlot {
  declare onChangeSignal: any;
  declare content: any;
  constructor() {
         
         this.onChangeSignal = new Signal();
      }
  get onChange() {
         return this.onChangeSignal;
      }
  remove(item) {
      }
  add(content) {
         this.content = content;
      }
  moveFrom(item, dragContainer) {
      }
  getContent() {
         return this.content;
      }
  isEmpty() {
         return this.content == null;
      }
  canMoveFrom(item, dragContainer) {
         return false;
      }
  itsCompatible(item, dragContainer) {
         return false;
      }
  canSwap(dragContainer) {
         return false;
      }
  getContainToDrag() {
         return null;
      }
  isLocked() {
         return true;
      }
  canRemove(item) {
         return false;
      }
  clear() {
         this.onChangeSignal.clear();
         this.onChangeSignal = null;
      }
}
NullSlot.prototype.onChangeSignal = null;
NullSlot.prototype.content = null;
bindMethods(NullSlot);
