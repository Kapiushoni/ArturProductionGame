import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Item } from '@/game/main_game/items/Item';

/** A placeholder slot: nothing can be dragged into or out of it. */
export class NullSlot implements ISlot {
  private onChangeSignal: Signal;
  private content: Item = null;

  constructor() {
    this.onChangeSignal = new Signal();
  }
  get onChange(): Signal {
    return this.onChangeSignal;
  }
  remove(_item: Item) {}
  add(item: Item) {
    this.content = item;
  }
  moveFrom(_item: Item, _from: IDragContainer) {}
  getContent(): Item {
    return this.content;
  }
  isEmpty(): boolean {
    return this.content == null;
  }
  canMoveFrom(_item: Item, _from: IDragContainer): boolean {
    return false;
  }
  itsCompatible(_item: Item, _from: IDragContainer): boolean {
    return false;
  }
  canSwap(_other: IDragContainer): boolean {
    return false;
  }
  getContainToDrag(): Item {
    return null;
  }
  isLocked(): boolean {
    return true;
  }
  canRemove(_item: Item): boolean {
    return false;
  }
  clear() {
    this.onChangeSignal.clear();
    this.onChangeSignal = null;
  }
}
bindMethods(NullSlot);
