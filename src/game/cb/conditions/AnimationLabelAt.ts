import { bindMethods } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';

/** The animation is at a label. */
export class AnimationLabelAt implements Condition {
  private condLabel: string;

  constructor(label: string) {
    this.condLabel = label;
  }
  complete(clip: any): boolean {
    return clip.currentLabel == this.condLabel;
  }
}
bindMethods(AnimationLabelAt);
