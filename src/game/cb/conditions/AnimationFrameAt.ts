import { bindMethods, int } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';

/** The animation is at a frame. */
export class AnimationFrameAt implements Condition {
  private condFrame: number;

  constructor(frame: number) {
    this.condFrame = int(frame);
  }
  complete(clip: any): boolean {
    return clip.currentFrame == this.condFrame;
  }
}
bindMethods(AnimationFrameAt);
