import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';

/** A placeholder slot: nothing can be dragged into or out of it. */
export class NullSlot implements ISlot {
  private onChangeSignal: Signal;
  private content: any = null;

  constructor() {
    this.onChangeSignal = new Signal();
  }
  get onChange(): Signal {
    return this.onChangeSignal;
  }
  remove(_item: any) {}
  add(item: any) {
    this.content = item;
  }
  moveFrom(_item: any, _from: IDragContainer) {}
  getContent(): any {
    return this.content;
  }
  isEmpty(): boolean {
    return this.content == null;
  }
  canMoveFrom(_item: any, _from: IDragContainer): boolean {
    return false;
  }
  itsCompatible(_item: any, _from: IDragContainer): boolean {
    return false;
  }
  canSwap(_other: IDragContainer): boolean {
    return false;
  }
  getContainToDrag(): any {
    return null;
  }
  isLocked(): boolean {
    return true;
  }
  canRemove(_item: any): boolean {
    return false;
  }
  clear() {
    this.onChangeSignal.clear();
    this.onChangeSignal = null;
  }
}
bindMethods(NullSlot);
