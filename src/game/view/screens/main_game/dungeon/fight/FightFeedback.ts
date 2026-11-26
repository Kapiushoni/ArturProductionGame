// @ts-nocheck
import { Sprite, bindMethods, int } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';

export class FightFeedback extends Sprite {
  static readonly gap = Number(-50);
  declare slots: any;
  constructor() {
          super();
         this.slots = new Object();
         this.slots[0] = null;
         this.slots[1] = null;
         this.slots[2] = null;
      }
  showIn(displayObjectContainer) {
         displayObjectContainer.addChild(this);
      }
  addFeedback(clip) {
         var clip2 = null;
         var i = int(0);
         while(i < 3)
         {
            if(!this.slots[i])
            {
               this.slots[i] = clip;
               if(i > 0)
               {
                  clip2 = this.slots[i - 1];
                  clip.y = clip2.y + clip2.height + FightFeedback.gap;
               }
               this.makeAppear(clip);
               break;
            }
            i++;
         }
      }
  makeAppear(clip) {
         this.addChild(clip);
         clip.gotoAndPlay(1);
         var smartMC = new SmartMC(clip);
         smartMC.trigger(new EndAnimation(),new Functor(this.removePoster,clip));
      }
  removePoster(clip, list) {
         var clip2 = list[0];
         var i = int(0);
         while(i < 3)
         {
            if(this.slots[i] == clip2)
            {
               this.slots[i] = null;
               clip2.stop();
               this.removeChild(clip2);
               break;
            }
            i++;
         }
      }
  pause() {
         var i = int(0);
         while(i < 3)
         {
            if(this.slots[i])
            {
               this.slots[i].stop();
            }
            i++;
         }
      }
  resume() {
         var i = int(0);
         while(i < 3)
         {
            if(this.slots[i])
            {
               this.slots[i].play();
            }
            i++;
         }
      }
  clear() { const __self = this;
         var i = int(0);
         while(i < 3)
         {
            if(this.slots[i])
            {
               this.slots[i].stop();
            }
            i++;
         }
         if(__self.parent)
         {
            __self.parent.removeChild(this);
         }
         this.slots = null;
      }
}
FightFeedback.prototype.slots = null;
bindMethods(FightFeedback);
