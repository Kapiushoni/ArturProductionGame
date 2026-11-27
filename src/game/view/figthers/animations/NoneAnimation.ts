import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';
import type { FighterView } from '@/game/view/figthers/FighterView';

/** No animation (nothing is playing). */
export class NoneAnimation implements IFighterAnimation {
  atFinish: Signal;

  constructor() {
    this.atFinish = new Signal();
  }
  forceKill(): boolean {
    return false;
  }
  getName(): string {
    return '';
  }
  make(_fighterView: FighterView) {}
  pause() {}
  resume() {}
  kill() {
    this.atFinish.clear();
    this.atFinish = null;
  }
  mustGoToIdle(): boolean {
    return false;
  }
}
bindMethods(NoneAnimation);
