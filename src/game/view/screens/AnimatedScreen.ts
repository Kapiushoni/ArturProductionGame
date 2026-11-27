import { bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';

export class AnimatedScreen extends Screen {
  enterLabel: any = null;
  leaveLabel: any = null;
  /** like Screen: subclasses call super() and then initAnimatedScreen(...) */
  constructor(cls: any = null, dict: any = null, enterLabel: string = 'in', leaveLabel: string = 'out') {
    super();
    if (cls != null) this.initAnimatedScreen(cls, dict, enterLabel, leaveLabel);
  }
  initAnimatedScreen(cls: any, dict: any, enterLabel: string = 'in', leaveLabel: string = 'out') {
    this.initScreen(cls, dict);
    this.enterLabel = enterLabel;
    this.leaveLabel = leaveLabel;
  }
  enter(callback: Function = null) {
    this.bg.gotoAndPlay(this.enterLabel);
    this.callOnEnd(this.bg, callback);
  }
  leave(callback: Function = null) {
    if (!this.bg) {
      if (callback) callback();
      return;
    }
    this.bg.gotoAndPlay(this.leaveLabel);
    this.callOnEnd(this.bg, callback);
  }
  callOnEnd(clip: any, callback: Function = null) {
    var smc = null;
    var mc = clip;
    var fc = callback;
    if (fc != null) {
      smc = new SmartMC(mc);
      smc.trigger(
        new EndCurrentLabel(mc),
        Functor.wrap(() => {
          this.bg.stop();
          fc();
          smc.clear();
        }),
      );
    }
  }
}
bindMethods(AnimatedScreen);
