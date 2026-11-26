// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';

export class AnimatedScreen extends Screen {
  declare enterLabel: any;
  declare leaveLabel: any;
  constructor(...__a) { super(__DEFER); if (__a[0] !== __DEFER) this.__init_AnimatedScreen(...__a); }
  __init_AnimatedScreen(cls, dict, enterLabel = "in", leaveLabel = "out") {
         this.__init_Screen(cls,dict);
         this.enterLabel = enterLabel;
         this.leaveLabel = leaveLabel;
      }
  enter(callback = null) { const __self = this;
         __self.bg.gotoAndPlay(this.enterLabel);
         this.callOnEnd(__self.bg,callback);
      }
  leave(callback = null) { const __self = this;
         if (!__self.bg) { if (callback) callback(); return; }
         __self.bg.gotoAndPlay(this.leaveLabel);
         this.callOnEnd(__self.bg,callback);
      }
  callOnEnd(clip, callback = null) { const __self = this;
         var smc = null;
         var mc = clip;
         var fc = callback;
         if(fc != null)
         {
            smc = new SmartMC(mc);
            smc.trigger(new EndCurrentLabel(mc),Functor.wrap(function()
            {
               __self.bg.stop();
               fc();
               smc.clear();
            }));
         }
      }
}
AnimatedScreen.prototype.enterLabel = null;
AnimatedScreen.prototype.leaveLabel = null;
bindMethods(AnimatedScreen);
