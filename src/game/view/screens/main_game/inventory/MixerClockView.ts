// @ts-nocheck
import { Dictionary, __DEFER, bindMethods, uint } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { main } from '@/game/main';
import { Effect } from '@/game/view/effect/Effect';

export class MixerClockView extends Screen {
  constructor(mixerClock) {super(__DEFER); const __self = this; 
          this.__init_Screen(main.swfLoader.getClass("assets.Time"),new Dictionary());
         mixerClock.onTic.add(this.refresh);
         mixerClock.atEndMix.add(this.removeClock);
         __self.bg.gotoAndStop(0);
      }
  refresh(num) { num = uint(num);
         this.bg.gotoAndStop(num);
      }
  removeClock() { const __self = this;
         var cls = main.swfLoader.getClass("assets.Stars");
         var effect = new Effect(new cls());
         effect.playOn(__self.bg.parent);
         __self.pop();
      }
}
bindMethods(MixerClockView);
