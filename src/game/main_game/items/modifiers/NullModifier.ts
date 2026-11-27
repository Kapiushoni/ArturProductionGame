import { bindMethods } from '@/flash/as3';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/** "No modifier" (an empty modifier slot of an item). */
export class NullModifier implements IModifier {
  affect(_stats: Stats) {}
  disaffect(_stats: Stats) {}
  getValue(): number {
    return 0;
  }
  getCategory(): number {
    return StatType.NULL;
  }
  isInstant(): boolean {
    return true;
  }
  clear() {}
  toObject() {
    return {
      Category: null,
      Value: null,
    };
  }
}
bindMethods(NullModifier);
