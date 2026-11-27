import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

/** A lock flag with a change signal: onLock(locker) whenever it changes. */
export class Locker {
  private locked: boolean;
  private lockSignal: Signal;

  constructor(locked = false) {
    this.locked = locked;
    this.lockSignal = new Signal();
  }
  get onLock(): Signal {
    return this.lockSignal;
  }
  get isLocked(): boolean {
    return this.locked;
  }
  lock() {
    if (!this.locked) {
      this.locked = true;
      this.onLock.emit(this);
    }
  }
  unlock() {
    if (this.locked) {
      this.locked = false;
      this.onLock.emit(this);
    }
  }
  clear() {
    this.lockSignal.clear();
    this.lockSignal = null;
  }
}
bindMethods(Locker);
