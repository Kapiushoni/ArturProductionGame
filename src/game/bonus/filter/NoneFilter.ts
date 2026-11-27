import { bindMethods } from '@/flash/as3';
import type { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { Element } from '@/game/main_game/element/Element';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';

/** No enemies. */
export class NoneFilter implements IBonusFilter {
  doesApply(_element: Element): boolean {
    return false;
  }
  getIcons(): BonusIcon[] {
    return [];
  }
}
bindMethods(NoneFilter);
