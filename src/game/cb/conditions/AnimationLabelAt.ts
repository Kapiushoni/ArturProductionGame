// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class AnimationLabelAt {
  declare condLabel: any;
  constructor(condLabel) {
         
         this.condLabel = condLabel;
      }
  complete(clip) {
         return clip.currentLabel == this.condLabel;
      }
}
AnimationLabelAt.prototype.condLabel = null;
bindMethods(AnimationLabelAt);
