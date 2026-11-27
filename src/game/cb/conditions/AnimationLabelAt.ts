import { bindMethods } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';
import type { MovieClip } from '@/flash/as3';

/** The animation is at a label. */
export class AnimationLabelAt implements Condition {
  private condLabel: string;

  constructor(label: string) {
    this.condLabel = label;
  }
  complete(clip: MovieClip): boolean {
    return clip.currentLabel == this.condLabel;
  }
}
bindMethods(AnimationLabelAt, ['complete']);
