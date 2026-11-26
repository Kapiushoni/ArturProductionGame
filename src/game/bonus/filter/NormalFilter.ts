// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';

export class NormalFilter {
  constructor() {
         
      }
  doesApply(element) {
         return !element.isOfFire && !element.isOfIce;
      }
  getIcons() {
         var _loc1_ = [];
         _loc1_.push(BonusIcon.getNormal());
         return _loc1_;
      }
}
bindMethods(NormalFilter);
