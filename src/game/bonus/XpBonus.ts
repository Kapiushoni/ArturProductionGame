import { as3values, bindMethods, int } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { XpCalculator } from '@/game/main_game/dungeon/XpCalculator';
import { BonusFilters } from '@/game/bonus/filter/IBonusFilter';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';
import type { IXpCalculator } from '@/game/main_game/dungeon/IXpCalculator';

/** "xpPercent": beaten enemies of the filter's element give `percent`% of their XP (rounded up). */
export class XpBonus implements IDailyBonus, IXpCalculator {
  private value: number;
  private filter: IBonusFilter;
  /** the normal calculator, for the mix and critical XP */
  private xpCalculator: XpCalculator = null;

  constructor(percent = 100, filter: IBonusFilter = null) {
    this.value = Number(percent) / 100;
    this.filter = filter ?? BonusFilters.All();
  }
  activate() {
    this.xpCalculator = new XpCalculator();
    Dungeon.xpCalulator = this;
  }
  getXp(defeated: any[]): number {
    let total = 0;
    for (const enemy of as3values(defeated)) {
      let xp = int(enemy.stats.getStat(StatType.EXPERIENCE).getValue());
      if (this.filter.doesApply(enemy.getElement())) {
        xp = int(Math.ceil(xp * this.value));
      }
      total = int(total + xp);
    }
    return total;
  }
  getMixXp(mixes: number, jinn: any): number {
    return Number(this.xpCalculator.getMixXp(int(mixes), jinn));
  }
  getCriticalXp(criticalHits: number, jinn: any): number {
    return Number(this.xpCalculator.getCriticalXp(int(criticalHits), jinn));
  }
  getIcon(): BonusIcon {
    return BonusIcon.getXpIcon();
  }
  getFilter(): IBonusFilter {
    return this.filter;
  }
  getAction(): string {
    return BonusIcon.Kill;
  }
}
bindMethods(XpBonus);
