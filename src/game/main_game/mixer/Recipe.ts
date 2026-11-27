import { bindMethods, int } from '@/flash/as3';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import type { Item } from '@/game/main_game/items/Item';

/** A special mix (mix.csv): ingredients i1 + i2 give the item `res`. */
export class Recipe {
  private id: number;
  private i1: string;
  private i2: string;
  private res: string;
  private show: boolean;

  constructor(id: number, i1: string, i2: string, res: string, show: boolean) {
    this.id = int(id);
    this.i1 = i1;
    this.i2 = i2;
    this.res = res;
    this.show = show;
  }
  getId(): number {
    return this.id;
  }
  /** shown as a hint (advice) to the player */
  get mustShow(): boolean {
    return this.show;
  }
  /** are these the ingredients (in any order, unless strictOrder)? "Mix_" prefixes are ignored */
  areIngredients(item: Item, item2: Item, strictOrder = false): boolean {
    const a = MixStrategy.removeMix(item.id);
    const b = MixStrategy.removeMix(item2.id);
    return (a == this.i1 && b == this.i2) || (!strictOrder && b == this.i1 && a == this.i2);
  }
  isResult(item: Item): boolean {
    return item.id == this.res;
  }
  get primary(): string {
    return this.i1;
  }
  get secondary(): string {
    return this.i2;
  }
  get result(): string {
    return this.res;
  }
}
bindMethods(Recipe);
