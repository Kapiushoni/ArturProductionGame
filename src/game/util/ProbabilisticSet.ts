import { bindMethods, int, uint } from '@/flash/as3';

/** Elements with weights: getElement() / pop() pick one at random, proportionally to its weight. */
export class ProbabilisticSet {
  private items: any[] = [];
  private probs: number[] = [];
  totalProb = 0;

  get length(): number {
    return uint(this.items.length);
  }
  /** picks an element and removes it */
  pop(): any {
    return this.remove(this.getOne());
  }
  getElement(): any {
    return this.items[this.getOne()];
  }
  remove(index: number): any {
    index = int(index);
    const prob = Number(this.probs[index]);
    const item = this.items[index];
    this.probs.splice(index, 1);
    this.items.splice(index, 1);
    this.totalProb = this.totalProb - prob;
    return item;
  }
  /** index of a random element (weighted) */
  getOne(): number {
    let roll = Math.random() * this.totalProb;
    for (let i = 0; i < this.items.length; i++) {
      const prob = Number(this.probs[i]);
      if (roll <= prob) {
        return i;
      }
      roll = roll - prob;
    }
    return this.items.length;
  }
  contains(item: any): boolean {
    return this.getIndexOf(item) >= 0;
  }
  /** by identity, or with item.equals() when the item has it */
  getIndexOf(item: any): number {
    const index = int(this.items.indexOf(item));
    // (AS3 hasOwnProperty('equals') is true for class methods; in JS they are on the prototype)
    if (index < 0 && typeof item.equals === 'function') {
      for (let i = 0; i < this.items.length; i++) {
        if (item.equals(this.items[i])) {
          return i;
        }
      }
    }
    return index;
  }
  add(item: any, weight = 1) {
    this.items.push(item);
    this.probs.push(Number(weight));
    this.totalProb = this.totalProb + Number(weight);
  }
}
bindMethods(ProbabilisticSet);
