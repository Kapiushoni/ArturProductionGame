// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class ShmabledumFeeling {
  declare theFeeling: any;
  constructor(theFeeling) {
         
         this.theFeeling = theFeeling;
      }
  static getJoy() {
         return new ShmabledumFeeling("happy");
      }
  static getSadness() {
         return new ShmabledumFeeling("sad");
      }
  get feeling() {
         return this.theFeeling;
      }
  make(interactiveShmabledum) {
         interactiveShmabledum.expressFeeling(this);
      }
}
ShmabledumFeeling.prototype.theFeeling = null;
bindMethods(ShmabledumFeeling);
