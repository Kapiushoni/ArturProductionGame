import { bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { Slot } from '@/game/main_game/item_containers/Slot';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Item } from '@/game/main_game/items/Item';

/** A loot slot: starts with an item that can only be taken out (nothing can be put back). */
export class OneTimeSlot extends Slot {
  constructor(item: Item | null) {
    super();
    this.add(item);
  }
  remove(item: Item) {
    super.remove(item);
    services.saveSystem.savePendingItems();
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
}
bindMethods(OneTimeSlot);
