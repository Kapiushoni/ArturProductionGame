import { bindMethods, int } from '@/flash/as3';

/** A numeric stat of a fighter (attack, defense, luck, ...), identified by a StatType. */
export class Stat {
  protected value: number;
  protected type: number;

  constructor(type: number, value = 0) {
    this.value = Number(value);
    this.type = int(type);
  }
  modifyValue(amount: number) {
    this.value += Number(amount);
  }
  getValue(): number {
    return this.value;
  }
  clear() {}
}
bindMethods(Stat, ['getValue', 'clear']);
