// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { OneLineComment } from '@/game/bonus/states/OneLineComment';
import { PossibleCommentEnd } from '@/game/bonus/states/PossibleCommentEnd';

export class MultipleLineComment extends OneLineComment {
  constructor(baseState) {
          super(baseState);
      }
  onSpace(text) {
         return this;
      }
  onMisc(text) { const __self = this;
         if(text == "*")
         {
            return new PossibleCommentEnd(__self.parent);
         }
         return this;
      }
}
bindMethods(MultipleLineComment);
