import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { Element } from '@/game/main_game/element/Element';

/** Which enemies a daily bonus applies to (by element), and the icons that show it. */
export interface IBonusFilter {
  doesApply(element: Element): boolean;
  getIcons(): BonusIcon[];
}

const filter = (doesApply: (element: Element) => boolean, icons: () => BonusIcon[]): IBonusFilter => ({
  doesApply,
  getIcons: icons,
});

/** The filters by their name in dailyBonus.di. */
export const BonusFilters = {
  All: () =>
    filter(
      () => true,
      () => [BonusIcon.getNormal(), BonusIcon.getFire(), BonusIcon.getIce()],
    ),
  Fire: () =>
    filter(
      (element) => element.isOfFire,
      () => [BonusIcon.getFire()],
    ),
  Ice: () =>
    filter(
      (element) => element.isOfIce,
      () => [BonusIcon.getIce()],
    ),
  /** neither fire nor ice */
  Normal: () =>
    filter(
      (element) => !element.isOfFire && !element.isOfIce,
      () => [BonusIcon.getNormal()],
    ),
  None: () =>
    filter(
      () => false,
      () => [],
    ),
};
