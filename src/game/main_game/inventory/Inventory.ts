import { as3as, as3values, bindMethods, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { Trash } from '@/game/main_game/inventory/Trash';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { Item } from '@/game/main_game/items/Item';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';

/** The 12 inventory slots (saved as inventory slots 0-11) and the trash. */
export class Inventory {
  static SLOTS = 12;
  private slots: Slot[];
  private trash: Trash;

  constructor() {
    this.trash = new Trash();
    this.slots = new Array(Inventory.SLOTS);
    for (let i = 0; i < Inventory.SLOTS; i++) {
      this.slots[i] = new Slot();
    }
    this.loadData();
  }
  /** loads the saved items, then saves every later change */
  loadData() {
    for (let i = 0; i < Inventory.SLOTS; i++) {
      const item = services.saveSystem.loadInventoryItem(i);
      if (item != null) {
        this.slots[i].add(item);
      }
      this.slots[i].onChange.add(this.saveSlot(i));
    }
  }
  saveSlot(index: number) {
    const i = uint(index);
    return (change: SlotChange) => {
      services.saveSystem.saveInventorySlot(i, change.getNewItem());
    };
  }
  getEmptySlot(): Slot | null {
    for (const slot of as3values(this.slots)) {
      if (slot.isEmpty()) {
        return slot;
      }
    }
    return null;
  }
  getTrash(): Trash {
    return this.trash;
  }
  itemOfSlot(index: number): Item | null {
    return as3as((as3as(this.slots[uint(index)], Slot) as Slot).getContent(), Item);
  }
  getSlot(index: number): Slot {
    return as3as(this.slots[uint(index)], Slot);
  }
  /** number of slots with an item */
  get fullSlots(): number {
    let count = 0;
    for (const slot of as3values(this.slots)) {
      if (!slot.isEmpty()) {
        count++;
      }
    }
    return count;
  }
  clear() {
    this.trash.clear();
    for (const slot of as3values(this.slots)) {
      slot.clear();
    }
  }
}
bindMethods(Inventory);
