import { as3as, bindMethods, int } from '@/flash/as3';
import { Modifier } from '@/game/main_game/items/modifiers/Modifier';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { Stat } from '@/game/main_game/character/stats/Stat';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/** Changes the maximum of health (MH) or experience (MX). */
export class MaxHealthModifier extends Modifier {
  /** the stat whose maximum is changed */
  private primary_char = 0;

  constructor(config: { Category: string; Value: any }) {
    super(config);
    if (this.characteristic == StatType.MAX_HP) {
      this.primary_char = int(StatType.HEALTH);
    } else if (this.characteristic == StatType.MAX_XP) {
      this.primary_char = int(StatType.EXPERIENCE);
    }
  }
  affect(stats: Stats) {
    (as3as(stats.getStat(this.primary_char), HealthStat) as HealthStat).modifyUpperBound(this.value);
  }
  disaffect(stats: Stats) {
    (as3as(stats.getStat(this.primary_char), HealthStat) as HealthStat).modifyUpperBound(-this.value);
  }
  getStat(stats: Stats): Stat {
    return (as3as(stats.getStat(this.primary_char), HealthStat) as HealthStat).getUpperBound();
  }
}
bindMethods(MaxHealthModifier);
