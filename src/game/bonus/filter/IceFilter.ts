// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';

export class IceFilter {
  constructor() {
         
      }
  doesApply(element) {
         return element.isOfIce;
      }
  getIcons() {
         var _loc1_ = [];
         _loc1_.push(BonusIcon.getIce());
         return _loc1_;
      }
}
bindMethods(IceFilter);
