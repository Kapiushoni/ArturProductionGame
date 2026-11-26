// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';

export class IdleAnimation extends FighterAnimation {
  constructor() {super(__DEFER); 
          this.__init_FighterAnimation("idle");
      }
}
bindMethods(IdleAnimation);
