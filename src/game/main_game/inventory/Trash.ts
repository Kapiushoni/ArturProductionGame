// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class Trash {
  declare onThrow: any;
  declare locked: any;
  constructor() {
         
         this.locked = false;
         this.onThrow = new Signal();
      }
  remove(item) {
         throw new Error("Trash Cant Remove Items");
      }
  canRemove(item) {
         return false;
      }
  moveFrom(item, dragContainer) {
         dragContainer.remove(item);
         this.add(item);
      }
  getContainToDrag() {
         return null;
      }
  add(item) {
         this.onThrow.emit(item);
         item.clear();
         main.saveSystem.savePendingItems();
         main.soundManager.playFx(GameSounds.ITEM_TRASH);
      }
  getContent() {
         return null;
      }
  isEmpty() {
         return true;
      }
  canMoveFrom(item, dragContainer) {
         return !this.locked;
      }
  itsCompatible(item, dragContainer) {
         return true;
      }
  clear() {
         this.onThrow.clear();
      }
  canSwap(dragContainer) {
         return false;
      }
  lock() {
         this.locked = true;
      }
  unlock() {
         this.locked = false;
      }
}
Trash.prototype.onThrow = null;
Trash.prototype.locked = false;
bindMethods(Trash);
