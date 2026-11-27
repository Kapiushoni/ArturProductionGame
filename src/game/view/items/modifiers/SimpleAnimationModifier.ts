import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Util } from '@/game/util/Util';
import type { MovieClip } from '@/flash/as3';

export class SimpleAnimationModifier {
  mcName: string = null;
  typeModifier: string = null;
  constructor(mcName: string, typeModifier: string) {
    this.mcName = mcName;
    this.typeModifier = typeModifier;
  }
  modify(clip: MovieClip) {
    this.setFrame(clip, this.mcName);
    this.setModifier(clip, this.typeModifier);
  }
  setFrame(clip: MovieClip, text: string) {
    clip.gotoAndStop(this.mcName);
  }
  setModifier(clip: MovieClip, text: string) {
    this.setIcon(clip.icon, text);
  }
  setIcon(clip: MovieClip, text: string) {
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
