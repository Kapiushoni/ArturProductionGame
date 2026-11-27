import { as3values, bindMethods } from '@/flash/as3';
import { cbArray } from '@/game/cb/utils/cbArray';

/**
 * A simple event: listeners are called in order with the emitted arguments.
 * Listeners added or removed during emit() take effect from the next emit().
 */
export class Signal {
  private slots = new cbArray();

  add(listener: Function) {
    this.slots.push(listener);
  }
  addAtFirst(listener: Function) {
    this.slots.unshift(listener);
  }
  emit(...args: any[]) {
    for (const listener of as3values(this.slots.clone())) {
      listener.apply(null, args);
    }
  }
  clear() {
    this.slots = new cbArray();
  }
  remove(listener: Function) {
    this.slots.remove(listener);
  }
}
bindMethods(Signal);
