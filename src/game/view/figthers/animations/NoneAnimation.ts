import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';

/** No animation (nothing is playing). */
export class NoneAnimation implements IFighterAnimation {
  private atFinish: Signal;

  constructor() {
    this.atFinish = new Signal();
  }
  forceKill(): boolean {
    return false;
  }
  getName(): string {
    return '';
  }
  make(_fighterView: any) {}
  pause() {}
  resume() {}
  kill() {
    this.atFinish.clear();
    this.atFinish = null;
  }
  getAtFinish(): Signal {
    return this.atFinish;
  }
  mustGoToIdle(): boolean {
    return false;
  }
}
bindMethods(NoneAnimation);
