import type { Item } from '@/game/main_game/items/Item';
import type { Recipe } from '@/game/main_game/mixer/Recipe';

/** What the mixer produced, and the special recipe it followed (null for a regular mix). */
export class MixResult {
  private _item: Item;
  private _recipe: Recipe | null;

  constructor(item: Item, recipe: Recipe = null) {
    this._item = item;
    this._recipe = recipe;
  }
  get recipe(): Recipe | null {
    return this._recipe;
  }
  get item(): Item {
    return this._item;
  }
}
