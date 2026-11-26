// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class Or {
  declare c1: any;
  declare c2: any;
  constructor(c1, c2) {
         
         this.c1 = c1;
         this.c2 = c2;
      }
  complete(clip) {
         return this.c1.complete(clip) || this.c2.complete(clip);
      }
}
Or.prototype.c1 = null;
Or.prototype.c2 = null;
bindMethods(Or);
