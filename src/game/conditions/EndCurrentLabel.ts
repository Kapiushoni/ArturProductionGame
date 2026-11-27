import { as3values, int } from '@/flash/as3';
import { AnimationFrameAt } from '@/game/cb/conditions/AnimationFrameAt';
import type { MovieClip } from '@/flash/as3';

/** The animation is at the last frame of the current label (the frame before the next label, or the last frame). */
export class EndCurrentLabel extends AnimationFrameAt {
  constructor(clip: MovieClip) {
    let nextLabelFrame = int(clip.totalFrames + 1);
    for (const label of as3values(clip.currentLabels)) {
      const frame = int(label.frame);
      if (frame < nextLabelFrame && frame > clip.currentFrame) {
        nextLabelFrame = frame;
      }
    }
    super(nextLabelFrame - 1);
  }
}
