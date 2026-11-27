import { bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';

/** Standing. */
export class IdleAnimation extends FighterAnimation {
  constructor() {
    super('idle');
  }
}
bindMethods(IdleAnimation);
