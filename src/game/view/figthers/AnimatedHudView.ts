import { bindMethods } from '@/flash/as3';
import { HudView } from '@/game/view/figthers/HudView';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { HudSetter } from '@/game/view/figthers/HudSetter';

export class AnimatedHudView extends HudView {
  constructor(cls: any, hudSetter: HudSetter) {
    super(cls, hudSetter);
    this.mc.gotoAndStop('in');
  }
  changeFighter(fighter: Fighter) {
    if (this.stats == null && fighter != null) {
      this.mc.gotoAndPlay('in');
    } else if (this.stats != null && fighter == null) {
      this.mc.gotoAndPlay('out');
    }
    super.changeFighter(fighter);
  }
}
bindMethods(AnimatedHudView);
