import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { MultipleLineComment } from '@/game/bonus/states/MultipleLineComment';

/** A "*" inside a /* comment: "/" ends it. */
export class PossibleCommentEnd extends BaseState {
  constructor(parent: BaseState) {
    super('', null, parent);
  }
  onMisc(char: string): BaseState {
    if (char == '/') {
      return this.parent;
    }
    return new MultipleLineComment(this.parent);
  }
  onDigit(_char: string): BaseState {
    return new MultipleLineComment(this.parent);
  }
  onSpace(_char: string): BaseState {
    return new MultipleLineComment(this.parent);
  }
  onLetter(_char: string): BaseState {
    return new MultipleLineComment(this.parent);
  }
}
bindMethods(PossibleCommentEnd);
