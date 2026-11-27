import { bindMethods } from '@/flash/as3';
import type { Stats } from '@/game/main_game/character/stats/Stats';
import type { Item } from '@/game/main_game/items/Item';

/** Applies and removes both modifiers of an item (equipped gear, consumed potions). */
export class StatsEffectGuardian {
  private stats: Stats | null;

  constructor(stats: Stats) {
    this.stats = stats;
  }
  removeEfectsOfItem(item: Item | null) {
    if (item != null) {
      item.getPrimaryModifier().disaffect(this.stats);
      item.getSecondaryModifier().disaffect(this.stats);
      this.stats.onChange.emit();
    }
  }
  addEfectsOfItem(item: Item | null) {
    if (item != null) {
      item.getPrimaryModifier().affect(this.stats);
      item.getSecondaryModifier().affect(this.stats);
      this.stats.onChange.emit();
    }
  }
  clear() {
    this.stats = null;
  }
}
bindMethods(StatsEffectGuardian);
