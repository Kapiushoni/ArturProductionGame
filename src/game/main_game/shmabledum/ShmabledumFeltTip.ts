// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Util } from '@/game/util/Util';

export class ShmabledumFeltTip {
  declare tip: any;
  declare feeling: any;
  constructor(tip, feeling) {
         
         this.tip = tip;
         this.feeling = feeling;
      }
  make(interactiveShmabledum) {
         interactiveShmabledum.expressFeeling(this.feeling,Util.l(this.tip.make,interactiveShmabledum));
      }
}
ShmabledumFeltTip.prototype.tip = null;
ShmabledumFeltTip.prototype.feeling = null;
bindMethods(ShmabledumFeltTip);
