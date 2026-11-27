import { bindMethods, int } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import { LevelingEnemies } from '@/game/main_game/character/stats/LevelingEnemies';
import { BonusFilters } from '@/game/bonus/filter/IBonusFilter';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';

/** "enemyExtraLevel": enemies of the filter's element are `extraLevel` levels higher (or lower if negative). */
export class ExtraLevelBonus implements IDailyBonus {
  private extraLevel: number;
  private filter: IBonusFilter;

  constructor(extraLevel = 0, filter: IBonusFilter = null) {
    this.extraLevel = int(Number(extraLevel));
    this.filter = filter ?? BonusFilters.None();
  }
  activate() {
    LevelingEnemies.setBonus(this);
  }
  /** called for every new enemy */
  apply(characterConfig: any, leveling: LevelingEnemies) {
    if (this.filter.doesApply(characterConfig.element)) {
      leveling.setExtraLevel(this.extraLevel);
    }
  }
  getIcon(): BonusIcon {
    return BonusIcon.getLevelIcon(this.extraLevel >= 0);
  }
  getFilter(): IBonusFilter {
    return this.filter;
  }
  getAction(): string {
    return BonusIcon.Kill;
  }
}
bindMethods(ExtraLevelBonus);
