// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class EndAnimation {
  constructor() {
         
      }
  complete(clip) {
         return clip.totalFrames == clip.currentFrame;
      }
}
bindMethods(EndAnimation);
