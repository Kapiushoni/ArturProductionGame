import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { Element } from '@/game/main_game/element/Element';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';

/** Ice enemies. */
export class IceFilter implements IBonusFilter {
  doesApply(element: Element): boolean {
    return element.isOfIce;
  }
  getIcons(): BonusIcon[] {
    return [BonusIcon.getIce()];
  }
}
bindMethods(IceFilter);
