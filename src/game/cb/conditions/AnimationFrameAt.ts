// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';

export class AnimationFrameAt {
  declare condFrame: any;
  constructor(condFrame) { condFrame = int(condFrame);
         
         this.condFrame = int(condFrame);
      }
  complete(clip) {
         return clip.currentFrame == this.condFrame;
      }
}
AnimationFrameAt.prototype.condFrame = 0;
bindMethods(AnimationFrameAt);
