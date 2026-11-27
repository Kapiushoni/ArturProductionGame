import type { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';

/** The bonus of the day (XpBonus, ExtraLevelBonus or ExtraDungeon), shown in the main menu. */
export interface IDailyBonus {
  /** turns the bonus on for this game */
  activate(game: any): void;
  getIcon(): BonusIcon;
  getFilter(): IBonusFilter;
  /** what the player has to do ("Kill") */
  getAction(): string;
}
