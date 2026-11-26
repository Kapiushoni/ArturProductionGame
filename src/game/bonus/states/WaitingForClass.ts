// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinition } from '@/game/bonus/states/ClassDefinition';

export class WaitingForClass extends BaseState {
  constructor() {
          super();
      }
  onSpace(text) {
         return this;
      }
  onLetter(text) { const __self = this;
         __self.stream.ungetc();
         return new ClassDefinition();
      }
}
bindMethods(WaitingForClass);
