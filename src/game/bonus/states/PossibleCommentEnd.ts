// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { MultipleLineComment } from '@/game/bonus/states/MultipleLineComment';

export class PossibleCommentEnd extends BaseState {
  constructor(baseState) {
          super("",null,baseState);
      }
  onMisc(text) { const __self = this;
         if(text == "/")
         {
            return __self.parent;
         }
         return new MultipleLineComment(__self.parent);
      }
  onDigit(text) { const __self = this;
         return new MultipleLineComment(__self.parent);
      }
  onSpace(text) { const __self = this;
         return new MultipleLineComment(__self.parent);
      }
  onLetter(text) { const __self = this;
         return new MultipleLineComment(__self.parent);
      }
}
bindMethods(PossibleCommentEnd);
