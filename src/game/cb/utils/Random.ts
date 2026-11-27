import { bindMethods, int } from '@/flash/as3';

export class Random {
  /** 0..max, both included */
  static nextInt(max: number): number {
    max = int(max);
    return int(Math.floor(Math.random() * (max + 1)));
  }
  /** min..max, both included */
  static nextRange(min: number, max: number): number {
    min = int(min);
    max = int(max);
    return int(Random.nextInt(max - min) + min);
  }
}
bindMethods(Random);
