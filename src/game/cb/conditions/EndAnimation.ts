import { bindMethods } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';

/** The animation is at its last frame. */
export class EndAnimation implements Condition {
  complete(clip: any): boolean {
    return clip.totalFrames == clip.currentFrame;
  }
}
bindMethods(EndAnimation);
