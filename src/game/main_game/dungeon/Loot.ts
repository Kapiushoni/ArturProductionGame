import { as3values, bindMethods, int } from '@/flash/as3';
import { OneTimeSlot } from '@/game/main_game/item_containers/OneTimeSlot';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';

/**
 * The 3 loot slots of a dungeon: first from `extraLoot` (first-time loot), the rest drawn
 * from the dungeon's lootData ([item id, weight] pairs).
 */
export class Loot {
  private slots: OneTimeSlot[];

  constructor(config: any, extraLoot: ProbabilisticSet) {
    this.slots = [];
    const dungeonLoot = new ProbabilisticSet();
    for (const entry of as3values(config.lootData)) {
      dungeonLoot.add(entry[0], entry[1]);
    }
    let i = 0;
    while (i < 3 && extraLoot.length > 0) {
      this.slots.push(this.makeSlot(extraLoot.pop()));
      i++;
    }
    for (let j = int(i); j < 3; j++) {
      this.slots.push(this.makeSlot(dungeonLoot.pop()));
    }
  }
  /** a slot with the item, or an empty one for null */
  makeSlot(itemId: string = null): OneTimeSlot {
    const item = itemId != null ? ItemFactory.getInstance().getItem(itemId) : null;
    return new OneTimeSlot(item);
  }
  getSlot(index: number): OneTimeSlot {
    return this.slots[int(index)];
  }
  getBooty(): OneTimeSlot[] {
    return this.slots;
  }
  clear() {
    for (const slot of as3values(this.slots)) {
      slot.clear();
    }
    this.slots = null;
  }
}
bindMethods(Loot);
