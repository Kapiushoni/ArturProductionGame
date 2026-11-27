import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { Element } from '@/game/main_game/element/Element';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';

/** All enemies. */
export class AllFilter implements IBonusFilter {
  doesApply(element: Element): boolean {
    return true;
  }
  getIcons(): BonusIcon[] {
    return [BonusIcon.getNormal(), BonusIcon.getFire(), BonusIcon.getIce()];
  }
}
bindMethods(AllFilter);
