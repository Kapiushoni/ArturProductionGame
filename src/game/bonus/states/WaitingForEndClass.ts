import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForEndClassError } from '@/game/bonus/errors/WaitingForEndClassError';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

/** After a block name: waits for "{". */
export class WaitingForEndClass extends BaseState {
  constructor() {
    super();
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  onMisc(char: string): BaseState {
    if (char == '{') {
      return new WaitingForAttribute();
    }
    throw new WaitingForEndClassError(char, this.stream.getLineNumber());
  }
}
bindMethods(WaitingForEndClass);
