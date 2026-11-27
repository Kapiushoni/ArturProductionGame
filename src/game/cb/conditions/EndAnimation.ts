import { bindMethods } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';
import type { MovieClip } from '@/flash/as3';

/** The animation is at its last frame. */
export class EndAnimation implements Condition {
  complete(clip: MovieClip): boolean {
    return clip.totalFrames == clip.currentFrame;
  }
}
bindMethods(EndAnimation, ['complete']);
