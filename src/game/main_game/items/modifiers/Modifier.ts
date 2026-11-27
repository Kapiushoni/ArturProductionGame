import { bindMethods, int } from '@/flash/as3';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';
import type { Stat } from '@/game/main_game/character/stats/Stat';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/** Adds `value` to one stat while the item is equipped. Config: { Category: "A" | "D" | "L" | ..., Value }. */
export class Modifier implements IModifier {
  protected characteristic: number;
  protected value: number;

  constructor(config: { Category: string; Value: any }) {
    this.characteristic = int(StatType.parse(config.Category));
    this.value = Number(config.Value);
  }
  affect(stats: Stats) {
    this.getStat(stats).modifyValue(this.value);
  }
  disaffect(stats: Stats) {
    this.getStat(stats).modifyValue(-this.value);
  }
  getStat(stats: Stats): Stat {
    return stats.getStat(this.characteristic);
  }
  getValue(): number {
    return this.value;
  }
  getCategory(): number {
    return this.characteristic;
  }
  isInstant(): boolean {
    return false;
  }
  clear() {}
  toObject() {
    return {
      Category: StatType.toString(this.characteristic),
      Value: this.value,
    };
  }
}
bindMethods(Modifier, ['getStat', 'getValue', 'getCategory', 'clear']);
