import { bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Item } from '@/game/main_game/items/Item';

/** A mixer slot: filled by the mixer itself, never by dragging. */
export class MixSlot extends Slot {
  canMoveFrom(_item: Item, _from: IDragContainer): boolean {
    return false;
  }
  canSwap(_other: IDragContainer): boolean {
    return false;
  }
  itsCompatible(_item: Item, _from: IDragContainer): boolean {
    return false;
  }
}
bindMethods(MixSlot);
