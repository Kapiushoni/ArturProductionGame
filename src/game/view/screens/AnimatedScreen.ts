import { __DEFER, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';

export class AnimatedScreen extends Screen {
  enterLabel: any = null;
  leaveLabel: any = null;
  constructor(...__a) {
    super(__DEFER);
    if (__a[0] !== __DEFER) this.__init_AnimatedScreen(__a[0], __a[1], __a[2], __a[3]);
  }
  __init_AnimatedScreen(cls, dict, enterLabel = 'in', leaveLabel = 'out') {
    this.__init_Screen(cls, dict);
    this.enterLabel = enterLabel;
    this.leaveLabel = leaveLabel;
  }
  enter(callback = null) {
    this.bg.gotoAndPlay(this.enterLabel);
    this.callOnEnd(this.bg, callback);
  }
  leave(callback = null) {
    if (!this.bg) {
      if (callback) callback();
      return;
    }
    this.bg.gotoAndPlay(this.leaveLabel);
    this.callOnEnd(this.bg, callback);
  }
  callOnEnd(clip, callback = null) {
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
