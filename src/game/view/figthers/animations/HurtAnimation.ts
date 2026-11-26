// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';

export class HurtAnimation extends FighterAnimation {
  static readonly DIE = "die";
  static readonly HURT = "hurt";
  static readonly EVADE = "evade";
  declare damage: any;
  declare element: any;
  constructor(damage, element) {super(__DEFER); 
         var text = null;
         this.damage = damage;
         if(damage.doesHeDie())
         {
            text = HurtAnimation.DIE;
         }
         else if(damage.doesHeHit())
         {
            text = HurtAnimation.HURT;
         }
         else
         {
            text = HurtAnimation.EVADE;
         }
         this.element = element;
          this.__init_FighterAnimation(text);
      }
  make(fighterView) { const __self = this;
         if(__self.name == HurtAnimation.EVADE)
         {
            fighterView.fighterSoundManager.playBlock();
         }
         else if(__self.name == HurtAnimation.HURT)
         {
            fighterView.fighterSoundManager.playHurt();
         }
         else if(__self.name == HurtAnimation.DIE)
         {
            fighterView.fighterSoundManager.playDie();
         }
         super.make(fighterView);
         __self.setEffect(fighterView.getMC(),this.element);
      }
  forceKill() {
         return true;
      }
  mustGoToIdle() {
         return this.name != "die";
      }
}
HurtAnimation.prototype.damage = null;
HurtAnimation.prototype.element = null;
bindMethods(HurtAnimation);
