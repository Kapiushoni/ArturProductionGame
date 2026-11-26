// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';

export class FireFilter {
  constructor() {
         
      }
  doesApply(element) {
         return element.isOfFire;
      }
  getIcons() {
         var _loc1_ = [];
         _loc1_.push(BonusIcon.getFire());
         return _loc1_;
      }
}
bindMethods(FireFilter);
