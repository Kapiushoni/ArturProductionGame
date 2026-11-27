import { bindMethods } from '@/flash/as3';
import type { Action } from '@/game/cb/actions/Action';
import type { MovieClip } from '@/flash/as3';

/** Removes the clip from its parent. */
export class RemoveFromParent implements Action {
  execute(clip: MovieClip) {
    clip.parent.removeChild(clip);
  }
}
bindMethods(RemoveFromParent);
