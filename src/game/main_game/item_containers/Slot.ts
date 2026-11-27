import { bindMethods } from '@/flash/as3';
import { assert } from '@/game/assert';
import { Signal } from '@/game/cb/signals/Signal';
import { SlotChange } from '@/game/main_game/item_containers/SlotChange';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { ItemContainer } from '@/game/main_game/item_containers/ItemContainer';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Item } from '@/game/main_game/items/Item';

/** Holds at most one item; onChange(SlotChange) on every change. A locked slot can't be dragged from or into. */
export class Slot implements ISlot, ItemContainer {
  private onChangeSignal: Signal;
  private content: Item | null = null;
  private locked = false;

  constructor() {
    this.onChangeSignal = new Signal();
  }
  get onChange(): Signal {
    return this.onChangeSignal;
  }
  /** takes `item` from `from`; the current content (if any) goes back to `from` */
  moveFrom(item: Item, from: IDragContainer) {
    let previous = null;
    if (!this.isEmpty()) {
      previous = this.getContent();
      this.remove(previous);
    }
    from.remove(item);
    this.add(item);
    if (previous != null) {
      from.add(previous);
    }
  }
  add(item: Item | null) {
    const change = new SlotChange(this, this.content, item);
    if (this.content != item) {
      this.content = item;
      this.onChange.emit(change);
    }
  }
  getContainToDrag(): Item | null {
    if (this.isEmpty() || this.isLocked() || !this.canRemove(this.getContent())) {
      return null;
    }
    return this.getContent();
  }
  remove(item: Item) {
    assert(this.content == item, 'The content its not present');
    this.empty();
  }
  empty() {
    const change = new SlotChange(this, this.content, null);
    if (this.content != null) {
      this.content = null;
      this.onChange.emit(change);
    }
  }
  isEmpty(): boolean {
    return this.content == null;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  isLocked(): boolean {
    return this.locked;
  }
  getContent(): Item {
    return this.content;
  }
  canRemove(item: Item): boolean {
    return !this.isLocked() && item == this.getContent();
  }
  canMoveFrom(item: Item, from: IDragContainer): boolean {
    return !this.isLocked() && (this.isEmpty() || from.canSwap(this)) && this.itsCompatible(item, from);
  }
  itsCompatible(item: Item, _from: IDragContainer): boolean {
    return item.canBeContained(this);
  }
  /** can the content of `other` come here while this content goes there? */
  canSwap(other: IDragContainer): boolean {
    if (other == this) {
      return false;
    }
    const item = other.getContainToDrag();
    return item != null && item.canBeContained(this);
  }
  canContainEquipment(): boolean {
    return true;
  }
  canContainWeapon(): boolean {
    return true;
  }
  canContainConsumable(): boolean {
    return true;
  }
  canContainShield(): boolean {
    return true;
  }
  clear() {
    this.onChange.clear();
    this.onChangeSignal = null;
  }
}
bindMethods(Slot, ['moveFrom', 'add', 'remove', 'empty', 'isEmpty', 'lock', 'unlock', 'getContent', 'clear']);
