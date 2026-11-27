import { bindMethods } from '@/flash/as3';
import type { Element } from '@/game/main_game/element/Element';

/** Fire vs ice multiplier of a hit (> 1: bonus for the attacker, < 1: the defender resisted). */
export class ElementBonus {
  element: Element;
  value: number;

  constructor(element: Element, value: number) {
    this.element = element;
    this.value = Number(value);
  }
}
bindMethods(ElementBonus);
