// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';

export class OneLineComment extends BaseState {
  constructor(baseState) {
          super("",null,baseState);
      }
  onMisc(text) {
         return this;
      }
  onSpace(text) { const __self = this;
         if(text == "\n")
         {
            return __self.parent;
         }
         return this;
      }
  onDigit(text) {
         return this;
      }
  onLetter(text) {
         return this;
      }
}
bindMethods(OneLineComment);
