import { bindMethods } from '@/flash/as3';
import { HudSetter } from '@/game/view/figthers/HudSetter';

export class HudSetterWithStats extends HudSetter {
  constructor() {
    super();
  }
  setHud(clip, stats = null) {
    super.setHud(clip, stats);
    if (stats != null) {
      clip.bar.title.visible = true;
      clip.attack.title.title.text = stats.getAttack();
      clip.luck.title.title.text = stats.getLuck();
      clip.defence.title.title.text = stats.getDefense();
    } else {
      clip.bar.title.visible = false;
      clip.attack.title.title.text = '-';
      clip.luck.title.title.text = '-';
      clip.defence.title.title.text = '-';
    }
  }
}
bindMethods(HudSetterWithStats);
