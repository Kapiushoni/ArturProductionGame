import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinition } from '@/game/bonus/states/ClassDefinition';

/** Between blocks: waits for a block name. */
export class WaitingForClass extends BaseState {
  constructor() {
    super();
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  onLetter(_char: string): BaseState {
    this.stream.ungetc();
    return new ClassDefinition();
  }
}
bindMethods(WaitingForClass);
