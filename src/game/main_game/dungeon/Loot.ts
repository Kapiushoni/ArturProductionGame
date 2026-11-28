import { as3values, bindMethods, int } from '@/flash/as3';
import { OneTimeSlot } from '@/game/main_game/item_containers/OneTimeSlot';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';
import { Roguelite } from '@/game/roguelite/Roguelite';
import type { DungeonConfigData } from '@/game/main_game/dungeon/DungeonConfigData';

/**
 * The 3 loot slots of a dungeon: first from `extraLoot` (first-time loot), the rest drawn
 * from the dungeon's lootData ([item id, weight] pairs).
 */
export class Loot {
  private slots: OneTimeSlot[];

  constructor(config: DungeonConfigData, extraLoot: ProbabilisticSet) {
    this.slots = [];
    const dungeonLoot = new ProbabilisticSet();
    for (const entry of as3values(config.lootData)) {
      dungeonLoot.add(
        entry[0],
        Roguelite.enabled ? Roguelite.lootWeight(entry[0], entry[1], this.category(entry[0])) : entry[1],
      );
    }
    let i = 0;
    while (i < 3 && extraLoot.length > 0) {
      const id = extraLoot.pop();
      if (Roguelite.enabled && id != null && Roguelite.isLocked(id)) continue;
      this.slots.push(this.makeSlot(id));
      i++;
    }
    for (let j = int(i); j < 3; j++) {
      this.slots.push(this.makeSlot(dungeonLoot.pop()));
    }
  }
  /** the item's category in items.csv (C: consumable, ...), null for no item */
  private category(itemId: string): string | null {
    return itemId == null ? null : (ItemFactory.config?.get(itemId)?.Category ?? null);
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
bindMethods(Loot, ['getSlot', 'clear']);
