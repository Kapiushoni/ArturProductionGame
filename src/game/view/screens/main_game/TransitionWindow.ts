// @ts-nocheck
import { Dictionary, __DEFER, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { Util } from '@/game/util/Util';

export class TransitionWindow extends AnimatedScreen {
  declare resources: any;
  declare onFinish: any;
  declare onStart: any;
  constructor(resources, onStart, onFinish = null) {super(__DEFER); 
          this.__init_AnimatedScreen(this.assetClass,new Dictionary(),"start","end");
         this.resources = resources;
         if(onFinish == null)
         {
            onFinish = Util.pass();
         }
         this.onFinish = onFinish;
         this.onStart = onStart;
      }
  get assetClass() {
         return main.swfLoader.getClass("assets.loading");
      }
  start(sprite) { const __self = this;
         sprite.addChild(this);
         __self.enter(this.startWaiting);
         main.soundManager.playFx(GameSounds.TRANSITION_IN);
      }
  startWaiting() { const __self = this;
         this.onStart();
         __self.bg.gotoAndPlay("idle");
         main.theLoader.onLoad.add(this.waitingForResources);
         this.waitingForResources();
      }
  waitingForResources() {
         if(!Util.areLoaded(this.resources,main.theLoader))
         {
            return;
         }
         main.theLoader.onLoad.remove(this.waitingForResources);
         this.onFinish();
         this.leave();
      }
  leave(callback = null) { const __self = this;
         var end = callback;
         main.soundManager.playFx(GameSounds.TRANSITION_OUT);
         super.leave(function()
         {
            if(end != null)
            {
               end();
            }
            __self.pop();
         });
      }
  clear() {
         this.onStart = null;
         this.onFinish = null;
         this.resources = null;
      }
}
TransitionWindow.prototype.resources = null;
TransitionWindow.prototype.onFinish = null;
TransitionWindow.prototype.onStart = null;
bindMethods(TransitionWindow);
