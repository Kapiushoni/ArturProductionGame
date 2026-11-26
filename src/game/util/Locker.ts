// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class Locker {
  declare locked: any;
  declare lockSignal: any;
  constructor(locked = false) {
         
         this.locked = locked;
         this.lockSignal = new Signal();
      }
  get onLock() {
         return this.lockSignal;
      }
  get isLocked() {
         return this.locked;
      }
  lock() {
         if(!this.locked)
         {
            this.locked = true;
            this.onLock.emit(this);
         }
      }
  unlock() {
         if(this.locked)
         {
            this.locked = false;
            this.onLock.emit(this);
         }
      }
  clear() {
         this.lockSignal.clear();
         this.lockSignal = null;
      }
}
Locker.prototype.locked = false;
Locker.prototype.lockSignal = null;
bindMethods(Locker);
