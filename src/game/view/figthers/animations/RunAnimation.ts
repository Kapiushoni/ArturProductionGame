// @ts-nocheck
import { __DEFER, bindMethods, uint } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';

export class RunAnimation extends FighterAnimation {
  declare fighter: any;
  declare steps: any;
  declare withStart: any;
  declare withFinish: any;
  constructor(steps, withStart = true, withFinish = true) {super(__DEFER); 
         var text = null;
         this.steps = uint(steps);
         this.withFinish = withFinish;
         this.withStart = withStart;
         if(withStart)
         {
            text = "idle2run";
         }
         else
         {
            text = "run";
         }
          this.__init_FighterAnimation(text); steps = uint(steps);
      }
  make(fighter) {
         this.fighter = fighter;
         super.make(fighter);
      }
  finish(clip) { const __self = this;
         switch(__self.name)
         {
            case "idle2run":
               this.name = "run";
               this.make(this.fighter);
               break;
            case "run":
               --this.steps;
               if(this.steps == 0)
               {
                  if(!this.withFinish)
                  {
                     this.realFinish();
                     return;
                  }
                  this.name = "run2idle";
               }
               this.make(this.fighter);
               break;
            case "run2idle":
               this.realFinish();
         }
      }
  forceKill() {
         return true;
      }
  realFinish() {
         super.finish(null);
      }
}
RunAnimation.prototype.fighter = null;
RunAnimation.prototype.steps = 0;
RunAnimation.prototype.withStart = false;
RunAnimation.prototype.withFinish = false;
bindMethods(RunAnimation);
