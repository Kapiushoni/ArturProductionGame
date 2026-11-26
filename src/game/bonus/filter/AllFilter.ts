// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';

export class AllFilter {
  constructor() {
         
      }
  doesApply(element) {
         return true;
      }
  getIcons() {
         var _loc1_ = [];
         _loc1_.push(BonusIcon.getNormal());
         _loc1_.push(BonusIcon.getFire());
         _loc1_.push(BonusIcon.getIce());
         return _loc1_;
      }
}
bindMethods(AllFilter);
