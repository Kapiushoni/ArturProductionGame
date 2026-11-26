// @ts-nocheck
import { as3values, bindMethods, int } from '@/flash/as3';
import { AnimationFrameAt } from '@/game/cb/conditions/AnimationFrameAt';

export class EndCurrentLabel extends AnimationFrameAt {
  constructor(clip) {
         var currentLabel = null;
         var frame = int(0);
         var text = clip.currentLabel;
         var num = int(clip.currentFrame);
         var num2 = int(clip.totalFrames + 1);
         for (currentLabel of as3values(clip.currentLabels))
         {
            frame = int(currentLabel.frame);
            if(frame < num2 && frame > clip.currentFrame)
            {
               num2 = int(frame);
            }
         }
          super(num2 - 1);
      }
}
bindMethods(EndCurrentLabel);
