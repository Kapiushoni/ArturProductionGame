// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { HudView } from '@/game/view/figthers/HudView';

export class AnimatedHudView extends HudView {
  constructor(cls, hudSetter) {
          super(cls,hudSetter);
         this.mc.gotoAndStop("in");
      }
  changeFighter(fighter) { const __self = this;
         if(__self.stats == null && fighter != null)
         {
            __self.mc.gotoAndPlay("in");
         }
         else if(__self.stats != null && fighter == null)
         {
            __self.mc.gotoAndPlay("out");
         }
         super.changeFighter(fighter);
      }
}
bindMethods(AnimatedHudView);
