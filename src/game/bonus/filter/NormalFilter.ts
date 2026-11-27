import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { Element } from '@/game/main_game/element/Element';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';

/** Normal (neither fire nor ice) enemies. */
export class NormalFilter implements IBonusFilter {
  doesApply(element: Element): boolean {
    return !element.isOfFire && !element.isOfIce;
  }
  getIcons(): BonusIcon[] {
    return [BonusIcon.getNormal()];
  }
}
bindMethods(NormalFilter);
