// @ts-nocheck
import { Dictionary, __DEFER, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { Signal } from '@/game/cb/signals/Signal';

export class TutorialView extends AnimatedScreen {
  declare onEnd: any;
  constructor(cls) {super(__DEFER); 
          this.__init_AnimatedScreen(cls,this.getButtonInfo(),"start","end");
         this.onEnd = new Signal();
      }
  getButtonInfo() {
         return new Dictionary();
      }
  leave(callback = null) { const __self = this;
         var end = callback;
         super.leave(function()
         {
            if(end != null)
            {
               end();
            }
            __self.onEnd.emit();
            __self.pop();
         });
      }
}
TutorialView.prototype.onEnd = null;
bindMethods(TutorialView);
