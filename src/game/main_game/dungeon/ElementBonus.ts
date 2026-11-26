// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class ElementBonus {
  declare element: any;
  declare value: any;
  constructor(element, value) { value = Number(value);
         
         this.element = element;
         this.value = Number(value);
      }
}
ElementBonus.prototype.element = null;
ElementBonus.prototype.value = NaN;
bindMethods(ElementBonus);
