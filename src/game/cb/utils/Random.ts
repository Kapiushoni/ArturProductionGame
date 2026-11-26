// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';

export class Random {
  constructor() {
         
      }
  static nextInt(num) { num = int(num);
         return int(Math.floor(Math.random() * (num + 1)));
      }
  static nextRange(num, num2) { num = int(num); num2 = int(num2);
         return int(Random.nextInt(num2 - num) + num);
      }
}
bindMethods(Random);
