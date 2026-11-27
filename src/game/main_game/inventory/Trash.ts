import { bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { Signal } from '@/game/cb/signals/Signal';
import { GameSounds } from '@/game/sound/GameSounds';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Item } from '@/game/main_game/items/Item';

/** Items dropped here are destroyed (onThrow(item) first). */
export class Trash implements IDragContainer {
  onThrow: Signal;
  private locked = false;

  constructor() {
    this.onThrow = new Signal();
  }
  remove(_item: Item) {
    throw new Error('Trash Cant Remove Items');
  }
  canRemove(_item: Item): boolean {
    return false;
  }
  moveFrom(item: Item, from: IDragContainer) {
    from.remove(item);
    this.add(item);
  }
  getContainToDrag(): Item | null {
    return null;
  }
  add(item: Item) {
    this.onThrow.emit(item);
    item.clear();
    services.saveSystem.savePendingItems();
    services.sound.playFx(GameSounds.ITEM_TRASH);
  }
  getContent(): Item | null {
    return null;
  }
  isEmpty(): boolean {
    return true;
  }
  canMoveFrom(_item: Item, _from: IDragContainer): boolean {
    return !this.locked;
  }
  itsCompatible(_item: Item, _from: IDragContainer): boolean {
    return true;
  }
  clear() {
    this.onThrow.clear();
  }
  canSwap(_other: IDragContainer): boolean {
    return false;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
}
bindMethods(Trash);
