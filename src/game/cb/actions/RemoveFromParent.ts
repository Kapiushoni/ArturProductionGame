// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class RemoveFromParent {
  constructor() {
         
      }
  execute(clip) {
         clip.parent.removeChild(clip);
      }
}
bindMethods(RemoveFromParent);
