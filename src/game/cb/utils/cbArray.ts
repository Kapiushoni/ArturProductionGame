import { as3values, bindMethods, int, uint } from '@/flash/as3';

/** Array with a few helpers. new cbArray(n) makes n empty slots, new cbArray(a, b) contains a and b (like AS3 Array). */
export class cbArray extends Array<any> {
  constructor(...items: any[]) {
    super();
    if (items.length == 1 && typeof items[0] === 'number') {
      const length = Number(items[0]);
      if (uint(length) != length) {
        throw new RangeError('Array index is not a 32-bit unsigned integer (' + length + ')');
      }
      this.length = uint(length);
    } else {
      this.length = items.length;
      for (let i = 0; i < items.length; i++) {
        this[i] = items[i];
      }
    }
  }
  static createFromArray(list: any[]): cbArray {
    const result = new cbArray();
    for (const item of as3values(list)) {
      result.push(item);
    }
    return result;
  }
  pushIfNotPresent(value: any) {
    if (this.indexOf(value) < 0) {
      this.push(value);
    }
  }
  /** removes value, or (with field) the first element whose element[field] === value */
  remove(value: any, field: string = null) {
    const index = field == null ? int(this.indexOf(value)) : this.indexOfField(value, field);
    if (index < 0) {
      return;
    }
    this.splice(index, 1);
  }
  indexOfField(value: any, field: string): number {
    for (let i = 0; i < this.length; i++) {
      if (value === this[i][field]) {
        return i;
      }
    }
    return -1;
  }
  clone(): cbArray {
    const copy = new cbArray();
    for (let i = 0; i < this.length; i++) {
      copy.push(this[i]);
    }
    return copy;
  }
  /** a copy without (one occurrence of) each element of list */
  subtract(list: any[]): cbArray {
    const result = this.clone();
    for (let i = 0; i < list.length; i++) {
      const index = int(result.indexOf(list[i]));
      if (index >= 0) {
        result.splice(index, 1);
      }
    }
    return result;
  }
}
bindMethods(cbArray);
