// @ts-nocheck
import { Point, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { main } from '@/game/main';

export class Effect {
  declare effect: any;
  constructor(effect) {
         
         this.effect = effect;
      }
  playOn(displayObjectContainer, displayObjectContainer2 = null) {
         var point = null;
         var popUpHolder = null;
         var point2 = null;
         if(displayObjectContainer2 == null)
         {
            point = displayObjectContainer.localToGlobal(new Point(0,0));
            popUpHolder = main.popUpHolder;
            point2 = popUpHolder.globalToLocal(point);
            this.effect.x = point2.x;
            this.effect.y = point2.y;
            displayObjectContainer2 = popUpHolder;
         }
         displayObjectContainer2.addChild(this.effect);
         this.effect.gotoAndPlay(1);
         var smartMC = new SmartMC(this.effect);
         smartMC.trigger(new EndAnimation(),new RemoveFromParent());
      }
  clear() {
         if(this.effect.parent != null)
         {
            this.effect.stop();
            this.effect.parent.removeChild(this.effect);
         }
         this.effect = null;
      }
}
Effect.prototype.effect = null;
bindMethods(Effect);
