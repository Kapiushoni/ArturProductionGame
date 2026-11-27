import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';

/** // comment: skipped until the end of the line. */
export class OneLineComment extends BaseState {
  constructor(parent: BaseState) {
    super('', null, parent);
  }
  onMisc(_char: string): BaseState {
    return this;
  }
  onSpace(char: string): BaseState {
    return char == '\n' ? this.parent : this;
  }
  onDigit(_char: string): BaseState {
    return this;
  }
  onLetter(_char: string): BaseState {
    return this;
  }
}
bindMethods(OneLineComment);
