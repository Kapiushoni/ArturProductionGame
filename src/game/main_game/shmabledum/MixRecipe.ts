import { as3as, bindMethods } from '@/flash/as3';
import type { Item } from '@/game/main_game/items/Item';

/** A special mix the player could make now: item1 + item2 -> result (id). */
export class MixRecipe {
  private item1Id: Item;
  private item2Id: Item;
  private resultId: string;

  constructor(item1: Item, item2: Item, result: string) {
    this.item1Id = item1;
    this.item2Id = item2;
    this.resultId = result;
  }
  /** same result from the same two kinds of items (in any order) */
  equals(other: any): boolean {
    const recipe = as3as(other, MixRecipe) as MixRecipe;
    if (recipe == null) {
      return false;
    }
    const sameOrder = recipe.item1.getID() == this.item1.getID() && recipe.item2.getID() == this.item2.getID();
    const swapped = recipe.item2.getID() == this.item1.getID() && recipe.item1.getID() == this.item2.getID();
    return this.result == recipe.result && (sameOrder || swapped);
  }
  get item1(): Item {
    return this.item1Id;
  }
  get item2(): Item {
    return this.item2Id;
  }
  get result(): string {
    return this.resultId;
  }
}
bindMethods(MixRecipe);
