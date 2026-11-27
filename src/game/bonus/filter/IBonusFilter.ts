import type { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { Element } from '@/game/main_game/element/Element';

/** Which enemies a daily bonus applies to (by element), and the icons that show it. */
export interface IBonusFilter {
  doesApply(element: Element): boolean;
  getIcons(): BonusIcon[];
}
