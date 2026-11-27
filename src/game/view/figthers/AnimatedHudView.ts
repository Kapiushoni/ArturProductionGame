import { bindMethods } from '@/flash/as3';
import { HudView } from '@/game/view/figthers/HudView';

export class AnimatedHudView extends HudView {
  constructor(cls, hudSetter) {
    super(cls, hudSetter);
    this.mc.gotoAndStop('in');
  }
  changeFighter(fighter) {
    if (this.stats == null && fighter != null) {
      this.mc.gotoAndPlay('in');
    } else if (this.stats != null && fighter == null) {
      this.mc.gotoAndPlay('out');
    }
    super.changeFighter(fighter);
  }
}
bindMethods(AnimatedHudView);
