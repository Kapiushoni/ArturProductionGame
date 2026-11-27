import { bindMethods } from '@/flash/as3';
import type { Action } from '@/game/cb/actions/Action';

/** Removes the clip from its parent. */
export class RemoveFromParent implements Action {
  execute(clip: any) {
    clip.parent.removeChild(clip);
  }
}
bindMethods(RemoveFromParent);
