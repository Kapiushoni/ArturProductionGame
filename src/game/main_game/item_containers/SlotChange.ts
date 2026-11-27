import { bindMethods } from '@/flash/as3';
import type { Item } from '@/game/main_game/items/Item';

/** Emitted by Slot.onChange: the item in `slot` changed from old_item to new_item (either can be null). */
export class SlotChange {
  private slot: any;
  private old_item: Item | null;
  private new_item: Item | null;

  constructor(slot: any, old_item: Item | null, new_item: Item | null) {
    this.slot = slot;
    this.old_item = old_item;
    this.new_item = new_item;
  }
  getSlot(): any {
    return this.slot;
  }
  getOldItem(): Item | null {
    return this.old_item;
  }
  getNewItem(): Item | null {
    return this.new_item;
  }
}
bindMethods(SlotChange);
