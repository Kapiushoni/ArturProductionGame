import { bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import type { Element } from '@/game/main_game/element/Element';
import type { FighterView } from '@/game/view/figthers/FighterView';

/** Dying (stays on the last frame). */
export class DieAnimation extends FighterAnimation {
  static readonly DIE = 'die';
  private element: Element = null;

  constructor(element: Element = null) {
    super(DieAnimation.DIE);
    this.element = element;
  }
  make(fighterView: FighterView) {
    fighterView.fighterSoundManager.playDie();
    super.make(fighterView);
    this.setEffect(fighterView.getMC(), this.element);
  }
  forceKill(): boolean {
    return true;
  }
  mustGoToIdle(): boolean {
    return false;
  }
}
bindMethods(DieAnimation);
