import { bindMethods, int } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';
import type { MovieClip } from '@/flash/as3';

/** The animation is at a frame. */
export class AnimationFrameAt implements Condition {
  private condFrame: number;

  constructor(frame: number) {
    this.condFrame = int(frame);
  }
  complete(clip: MovieClip): boolean {
    return clip.currentFrame == this.condFrame;
  }
}
bindMethods(AnimationFrameAt, ['complete']);
