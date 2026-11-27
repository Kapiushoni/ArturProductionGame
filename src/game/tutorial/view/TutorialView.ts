import { Dictionary, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { Signal } from '@/game/cb/signals/Signal';

/** A tutorial window (animated in on "start", out on "end"); onEnd when it has closed. */
export class TutorialView extends AnimatedScreen {
  onEnd: Signal;

  /** cls: library class of the window clip */
  constructor(cls: any) {
    super();
    this.initAnimatedScreen(cls, this.getButtonInfo(), 'start', 'end');
    this.onEnd = new Signal();
  }
  /** buttons of the window (none) */
  getButtonInfo(): any {
    return new Dictionary();
  }
  leave(callback: Function = null) {
    super.leave(() => {
      if (callback != null) {
        callback();
      }
      this.onEnd.emit();
      this.pop();
    });
  }
}
bindMethods(TutorialView);
