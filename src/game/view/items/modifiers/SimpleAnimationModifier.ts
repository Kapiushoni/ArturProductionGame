import { bindMethods } from '@/flash/as3';
import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Util } from '@/game/util/Util';

export class SimpleAnimationModifier {
  mcName: any = null;
  typeModifier: any = null;
  constructor(mcName: string, typeModifier: string) {
    this.mcName = mcName;
    this.typeModifier = typeModifier;
  }
  modify(clip: any) {
    this.setFrame(clip, this.mcName);
    this.setModifier(clip, this.typeModifier);
  }
  setFrame(clip: any, text: string) {
    clip.gotoAndStop(this.mcName);
  }
  setModifier(clip: any, text: string) {
    this.setIcon(clip.icon, text);
  }
  setIcon(clip: any, text: string) {
    const mc = clip;
    const type = text;
    if (type == null) {
      try {
        mc.gotoAndStop('none');
      } catch (a) {
        mc.visible = false;
        Util.recursiveStop(mc);
      }
    } else {
      ModifierIcons.setStatIcon(mc, StatType.parse(type));
    }
  }
}
bindMethods(SimpleAnimationModifier);
