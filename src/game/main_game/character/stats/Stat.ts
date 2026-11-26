// @ts-nocheck
import { __DEFER, bindMethods, int } from '@/flash/as3';

export class Stat {
  declare value: any;
  declare type: any;
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_Stat(...__a); }
  __init_Stat(type, value = 0) { type = int(type); value = Number(value);
         
         this.value = Number(value);
         this.type = int(type);
      }
  modifyValue(num) { num = Number(num);
         this.value = Number(this.value + (num));
      }
  getValue() {
         return Number(this.value);
      }
  clear() {
      }
}
Stat.prototype.value = NaN;
Stat.prototype.type = 0;
bindMethods(Stat);
