// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';

export class DieAnimation extends FighterAnimation {
  static readonly DIE = "die";
  declare element: any;
  constructor(element = null) {super(__DEFER); 
          this.__init_FighterAnimation(DieAnimation.DIE);
      }
  make(fighterView) { const __self = this;
         fighterView.fighterSoundManager.playDie();
         super.make(fighterView);
         __self.setEffect(fighterView.getMC(),this.element);
      }
  forceKill() {
         return true;
      }
  mustGoToIdle() {
         return false;
      }
}
DieAnimation.prototype.element = null;
bindMethods(DieAnimation);
