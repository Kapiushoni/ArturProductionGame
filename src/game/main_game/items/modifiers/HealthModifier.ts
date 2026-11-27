import { bindMethods } from '@/flash/as3';
import { Modifier } from '@/game/main_game/items/modifiers/Modifier';
import { assert } from '@/game/assert';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/** Heals (potions): the health is not taken back when the effect ends. */
export class HealthModifier extends Modifier {
  constructor(config: { Category: string; Value: any }) {
    super(config);
    assert(this.characteristic == StatType.HEALTH, 'Health must be health');
  }
  disaffect(_stats: Stats) {}
}
bindMethods(HealthModifier);
