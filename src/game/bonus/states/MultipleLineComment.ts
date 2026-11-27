import { bindMethods } from '@/flash/as3';
import { OneLineComment } from '@/game/bonus/states/OneLineComment';
import { PossibleCommentEnd } from '@/game/bonus/states/PossibleCommentEnd';
import type { BaseState } from '@/game/bonus/states/BaseState';

/** A block comment: skipped until the closing star + slash. */
export class MultipleLineComment extends OneLineComment {
  onSpace(_char: string): BaseState {
    return this;
  }
  onMisc(char: string): BaseState {
    if (char == '*') {
      return new PossibleCommentEnd(this.parent);
    }
    return this;
  }
}
bindMethods(MultipleLineComment);
