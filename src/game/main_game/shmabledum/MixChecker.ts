import { as3as, as3values, bindMethods, int } from '@/flash/as3';
import { services } from '@/game/services';
import { Random } from '@/game/cb/utils/Random';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { MixRecipe } from '@/game/main_game/shmabledum/MixRecipe';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';
import type { Item } from '@/game/main_game/items/Item';

/**
 * Finds special recipes (with showAdvice) the player could make from the items in `slots` (gear, mixer, inventory)
 * and new items. Remembers the last MEMORY proposals so the same mix is not proposed again and again.
 */
export class MixChecker {
  static readonly MEMORY = 3;
  private banned: MixRecipe[];
  private slots: any[];
  private mixables: ProbabilisticSet = null;

  constructor(slots: any[]) {
    this.banned = [];
    this.slots = slots;
  }
  /** mixes of the given items with the items in the slots */
  checkForMixes(items: Item[]): boolean {
    if (!services.tutorial.isMixKnown()) {
      return false;
    }
    this.mixables = new ProbabilisticSet();
    for (const item of as3values(items)) {
      this.checkMixWithItem(item);
    }
    return this.mixables.length > 0;
  }
  /** mixes of the items of `extraSlots` with the slots, and among the slots themselves */
  searchForSlotsMixes(extraSlots: any[]): boolean {
    this.mixables = new ProbabilisticSet();
    if (extraSlots != null && extraSlots.length > 0) {
      const items = [];
      for (const slot of as3values(extraSlots)) {
        const item = slot.getContent();
        if (item != null) {
          items.push(item);
        }
      }
      if (items.length > 0) {
        this.checkForMixes(items);
      }
    }
    for (let j = 0; j < this.slots.length - 1; j++) {
      const first = this.slots[j].getContent();
      if (first != null) {
        for (let i = int(j + 1); i < this.slots.length; i++) {
          const second = this.slots[i].getContent();
          if (second != null) {
            this.checkMixWithItems(first, second);
          }
        }
      }
    }
    return this.mixables.length > 0;
  }
  /** a random found mix, preferring the ones not proposed recently */
  getMix(): MixRecipe | null {
    const recent = [];
    while (this.mixables.length > 0) {
      const recipe = as3as(this.mixables.pop(), MixRecipe) as MixRecipe;
      if (!this.isBanned(recipe)) {
        this.addBanned(recipe);
        return recipe;
      }
      recent.push(recipe);
    }
    if (recent.length > 0) {
      return recent[Random.nextInt(recent.length - 1)];
    }
    return null;
  }
  addBanned(recipe: MixRecipe) {
    if (!this.isBanned(recipe)) {
      if (this.banned.length >= MixChecker.MEMORY) {
        this.banned.shift();
      }
      this.banned.push(recipe);
    }
  }
  isBanned(recipe: MixRecipe): boolean {
    for (const banned of as3values(this.banned)) {
      if (banned.equals(recipe)) {
        return true;
      }
    }
    return false;
  }
  checkMixWithItem(item: Item | null) {
    if (item == null) {
      return;
    }
    for (const slot of as3values(this.slots)) {
      if (!slot.isEmpty()) {
        this.checkMixWithItems(item, slot.getContent());
      }
    }
  }
  /** both orders (recipes are checked with a strict order here) */
  checkMixWithItems(item: Item, item2: Item) {
    let recipe = MixStrategy.getSpecialMixId(item, item2, true);
    if (recipe != null && recipe.mustShow) {
      this.addRecipe(new MixRecipe(item, item2, recipe.result), this.mixables);
    }
    recipe = MixStrategy.getSpecialMixId(item2, item, true);
    if (recipe != null && recipe.mustShow) {
      this.addRecipe(new MixRecipe(item2, item, recipe.result), this.mixables);
    }
  }
  addRecipe(recipe: MixRecipe, set: ProbabilisticSet) {
    if (!set.contains(recipe)) {
      set.add(recipe);
    }
  }
  clear() {
    this.banned = null;
    this.mixables = null;
  }
}
bindMethods(MixChecker, ['clear']);
