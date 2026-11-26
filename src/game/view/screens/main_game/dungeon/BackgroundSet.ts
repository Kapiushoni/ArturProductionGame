// @ts-nocheck
import { as3values, bindMethods } from '@/flash/as3';
import { main } from '@/game/main';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';

export class BackgroundSet {
  declare types: any;
  constructor(list) {
         var param1Item = null;
         
         this.types = new ProbabilisticSet();
         for (param1Item of as3values(list))
         {
            this.types.add(param1Item,1);
         }
      }
  getBackground() {
         var element = this.types.getElement();
         var cls = main.swfLoader.getClass("assets." + element);
         return new cls();
      }
}
BackgroundSet.prototype.types = null;
bindMethods(BackgroundSet);
