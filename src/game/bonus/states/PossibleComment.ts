import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { CommentError } from '@/game/bonus/errors/CommentError';
import { MultipleLineComment } from '@/game/bonus/states/MultipleLineComment';
import { OneLineComment } from '@/game/bonus/states/OneLineComment';

/** After "/": "//" or "/*" starts a comment; afterwards parsing continues in `parent`. */
export class PossibleComment extends BaseState {
  constructor(parent: BaseState) {
    super(null, null, parent);
  }
  onMisc(char: string): BaseState {
    if (char == '*') {
      return new MultipleLineComment(this.parent);
    }
    if (char == '/') {
      return new OneLineComment(this.parent);
    }
    throw new CommentError(char, this.stream.getLineNumber());
  }
}
bindMethods(PossibleComment);
